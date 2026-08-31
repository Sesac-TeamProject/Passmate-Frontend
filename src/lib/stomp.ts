import { Client, type IMessage } from "@stomp/stompjs";
import { IS_MOCK, WS_URL } from "@/lib/env";
import { readGuestToken } from "@/lib/guest-token-storage";
import { PARTICIPANTS } from "@/lib/mocks/fixtures";
import { emitMockEvent, isMockSessionWaiting, mockSessionEvents } from "@/lib/mocks/session";
import { useAuthStore } from "@/lib/stores/auth-store";
import { parseServerEvent, type ServerEvent } from "@/lib/types/events";

type Status = "connecting" | "connected" | "reconnecting";
type Options = {
  roomId: number;
  isHost: boolean;
  onEvent: (e: ServerEvent) => void;
  onStatus: (s: Status) => void;
};

const MAX_BACKOFF_MS = 5_000;
const STEP_MS = 1_000;
const LOBBY_FILL_DELAY_MS = 300;
const LOBBY_FILL_STAGGER_MS = 200;

/**
 * 방 이벤트 스트림(계약 websocket-events). 구독: /topic/rooms/{id} (+ /host), /user/queue/feedback, /user/queue/errors.
 * 재연결은 선형 백오프(1s×n, 최대 5s). 재연결 후 스냅샷 재조회는 use-session-connection이 onStatus("connected")로 한다.
 * 목 모드(WS_URL 비어 있음)는 연결 없이 즉시 connected — 목 세션 제어(mockStartSession 등)가 흘려보내는
 * 이벤트를 그대로 전달한다(connectMockStream). 프로덕션·목 분기는 서로 섞이지 않는다.
 */
export function connectRoomStream({ roomId, isHost, onEvent, onStatus }: Options): () => void {
  if (IS_MOCK || !WS_URL) {
    return connectMockStream(onEvent, onStatus);
  }

  let attempt = 0;
  const token = useAuthStore.getState().accessToken ?? readGuestToken();
  const client = new Client({
    brokerURL: WS_URL,
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    reconnectDelay: STEP_MS,
    debug: () => {},
    beforeConnect: () => {
      client.reconnectDelay = Math.min(STEP_MS * (attempt + 1), MAX_BACKOFF_MS);
      onStatus(attempt === 0 ? "connecting" : "reconnecting");
    },
    onConnect: () => {
      attempt = 0;
      const handle = (m: IMessage) => {
        const event = parseServerEvent(safeJson(m.body));
        if (event) onEvent(event);
      };
      client.subscribe(`/topic/rooms/${roomId}`, handle);
      if (isHost) client.subscribe(`/topic/rooms/${roomId}/host`, handle);
      client.subscribe("/user/queue/feedback", handle);
      client.subscribe("/user/queue/errors", handle);
      onStatus("connected");
    },
    onWebSocketClose: () => {
      attempt += 1;
    },
  });

  client.activate();
  return () => {
    void client.deactivate();
  };
}

/**
 * 목 모드 연결: 실제 소켓 없이 0ms 후 connected, `mockSessionEvents`를 구독해 목 세션 제어가
 * 발행하는 이벤트를 그대로 전달한다. 접속 300ms 후 세션이 아직 WAITING이면 픽스처 참가자를
 * 200ms 간격으로 입장시켜 로비가 채워지는 모습을 보여준다. 모든 타이머는 반환 함수에서 정리한다.
 */
function connectMockStream(
  onEvent: (e: ServerEvent) => void,
  onStatus: (s: Status) => void,
): () => void {
  const timers: ReturnType<typeof setTimeout>[] = [];

  const listener = (e: Event) => {
    onEvent((e as CustomEvent<ServerEvent>).detail);
  };
  mockSessionEvents.addEventListener("event", listener);

  const fillLobby = () => {
    if (!isMockSessionWaiting()) return;
    PARTICIPANTS.forEach((p, index) => {
      timers.push(
        setTimeout(() => {
          emitMockEvent({
            type: "PARTICIPANT_JOINED",
            ts: new Date().toISOString(),
            data: {
              participantId: p.participantId,
              nickname: p.nickname,
              isGuest: p.isGuest ?? true,
              avatarId: p.avatarId,
              count: index + 1,
            },
          });
        }, index * LOBBY_FILL_STAGGER_MS),
      );
    });
  };

  timers.push(
    setTimeout(() => {
      onStatus("connected");
      timers.push(setTimeout(fillLobby, LOBBY_FILL_DELAY_MS));
    }, 0),
  );

  return () => {
    timers.forEach(clearTimeout);
    mockSessionEvents.removeEventListener("event", listener);
  };
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
