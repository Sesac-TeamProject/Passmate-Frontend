import { Client, ReconnectionTimeMode, type IMessage } from "@stomp/stompjs";
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
 * 재연결은 stompjs 내장 지수 백오프(1s → 최대 5s). 재연결 후 스냅샷 재조회는 use-session-connection이 onStatus("connected")로 한다.
 * 목 모드(IS_MOCK)만 연결 없이 즉시 connected — 목 세션 제어(mockStartSession 등)가 흘려보내는
 * 이벤트를 그대로 전달한다(connectMockStream). 프로덕션·목 분기는 서로 섞이지 않는다.
 * 실서버인데 WS 주소가 없으면 목으로 빠지지 않고 크게 실패한다(connecting 유지 + console.error).
 */
export function connectRoomStream({ roomId, isHost, onEvent, onStatus }: Options): () => void {
  if (IS_MOCK) {
    return connectMockStream(onEvent, onStatus);
  }

  if (!WS_URL) {
    // 실서버 연동인데 WS 주소가 없다 — 목 스트림으로 대체하면 화면만 "연결됨"으로 보이고 세션이 영원히 멈춘다.
    console.error(
      "[stomp] STOMP 주소가 비어 있어 실시간 세션에 연결할 수 없습니다. " +
        "NEXT_PUBLIC_WS_URL(예: ws://localhost:8080/ws)을 채우거나 NEXT_PUBLIC_API_BASE_URL을 확인하세요. " +
        "(Empty WebSocket endpoint: set NEXT_PUBLIC_WS_URL or a derivable NEXT_PUBLIC_API_BASE_URL. Realtime session will not connect.)",
    );
    onStatus("connecting");
    return () => {};
  }

  let attempt = 0;
  const client = new Client({
    brokerURL: WS_URL,
    connectHeaders: authHeaders(),
    reconnectDelay: STEP_MS,
    maxReconnectDelay: MAX_BACKOFF_MS,
    reconnectTimeMode: ReconnectionTimeMode.EXPONENTIAL,
    debug: () => {},
    beforeConnect: () => {
      // 재연결마다 토큰을 다시 읽는다 — 세션이 access token TTL보다 길면 최초 헤더는 이미 만료돼 있다(KMP StompClient와 동일).
      client.connectHeaders = authHeaders();
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
    onStompError: (frame) => {
      // 브로커가 거절(토큰 만료·구독 권한 없음 등) — stompjs는 조용히 재연결만 반복하므로 여기서 남긴다.
      console.warn("[stomp] 브로커 오류", frame.headers.message ?? "", frame.body);
      onStatus("reconnecting");
    },
    onWebSocketError: (event) => {
      console.warn("[stomp] 소켓 오류 — 주소·프로토콜을 확인하세요", WS_URL, event);
      onStatus("reconnecting");
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

/** 회원 토큰 우선, 없으면 게스트 토큰. 연결 시점마다 새로 읽는다. */
function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().accessToken ?? readGuestToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
