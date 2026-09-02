import { useAuthStore } from "@/lib/stores/auth-store";
import { AppError } from "@/lib/types/app-error";
import { AVATAR_KEYS, type AvatarKey } from "@/lib/types/dto";
import type {
  CreateRoomRequest,
  CreateRoomResponse,
  HostedRoomDto,
  HostedRoomsResponse,
  JoinRoomRequest,
  JoinRoomResponse,
  ParticipantEntry,
  ParticipantsResponse,
  PublicRoomPageResponse,
  RoomInfoResponse,
} from "@/lib/types/dto";
import { DEMO_PIN, DEMO_ROOM, HOSTED_ROOMS, PARTICIPANTS, PUBLIC_ROOMS } from "./fixtures";
import { currentProfile } from "./me";
import { emitMockEvent } from "./session";

/** 방(rooms) 도메인 목 응답. 입장 인원 등 상태가 필요한 값은 모듈 스코프에서 유지한다. */

const HOST_MIN_LEVEL_FOR_PAID = 3;

let hostedRooms: HostedRoomDto[] = [...HOSTED_ROOMS];
let nextHostedRoomId = 104;

/** 이번 세션에 새로 만든 방 — 발급한 PIN으로 다시 조회할 수 있어야 대기실로 들어간다 */
let createdRooms: RoomInfoResponse[] = [];

let participants: ParticipantEntry[] = [...PARTICIPANTS];
let nextParticipantId = 17;

function randomPin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function randomAvatarId(): AvatarKey {
  return AVATAR_KEYS[Math.floor(Math.random() * AVATAR_KEYS.length)];
}

/** GET /rooms/pin/{pin} — 404 잘못된 PIN. 계약상 410(종료된 방)은 시연 방에선 재현하지 않는다. */
export function mockRoomByPin(pin: string): RoomInfoResponse {
  if (pin === DEMO_PIN) return { ...DEMO_ROOM };
  const created = createdRooms.find((room) => room.pin === pin);
  if (!created) throw new AppError("NotFound");
  return { ...created };
}

/**
 * @draft 목 전용 호스트 등급. 서버 `MyProfileResponse`에는 등급이 없다(아직 계산하지 않는다) —
 * 실서버에서 유료 방은 등급이 아니라 400 `UNSUPPORTED_ROOM_TYPE`으로 막힌다.
 */
const MOCK_HOST_LEVEL = 3;

/** POST /rooms — 유료 방은 Lv.3 이상만 개설 가능 */
export function mockCreateRoom(body: CreateRoomRequest): CreateRoomResponse {
  if (body.isPaid && MOCK_HOST_LEVEL < HOST_MIN_LEVEL_FOR_PAID) {
    throw new AppError("PermissionDenied", { code: "HOST_LEVEL_REQUIRED" });
  }

  const roomId = nextHostedRoomId++;
  const pin = randomPin();

  createdRooms = [
    {
      roomId,
      pin,
      title: body.title,
      topic: body.topic ?? null,
      status: "WAITING",
      questionCount: null,
      participantCount: 0,
      maxParticipants: body.maxParticipants ?? null,
      scheduledAt: body.scheduledAt ?? null,
      isPaid: body.isPaid ?? false,
      entryFee: body.entryFee ?? null,
      host: { nickname: currentProfile().nickname, level: MOCK_HOST_LEVEL },
    },
    ...createdRooms,
  ];

  hostedRooms = [
    {
      roomId,
      pin,
      title: body.title,
      status: "WAITING",
      participantCount: 0,
      scheduledAt: body.scheduledAt ?? null,
      endedAtLabel: null,
      avgAccuracyPercent: null,
    },
    ...hostedRooms,
  ];

  return { roomId, pin, qrUrl: null };
}

/** GET /users/me/rooms/hosted */
export function mockHostedRooms(): HostedRoomsResponse {
  return { items: hostedRooms, nextCursor: null, hasNext: false };
}

/** /rooms 목록 한 페이지 — 시안이 카드 6장 뒤에 "더 보기"를 두므로 목도 6개씩 끊는다 */
const PUBLIC_PAGE_SIZE = 6;

/**
 * GET /rooms/public — type=free|paid 필터, q 부분 일치, sort=popular면 참여 인원 내림차순.
 * cursor는 다음 페이지의 시작 인덱스를 문자열로 담는다(서버 커서 형식은 계약에 없다).
 */
export function mockPublicRooms(url: URL): PublicRoomPageResponse {
  const type = url.searchParams.get("type") ?? "all";
  const sort = url.searchParams.get("sort") ?? "popular";
  const q = url.searchParams.get("q");
  const cursor = Number(url.searchParams.get("cursor") ?? 0) || 0;

  let items = PUBLIC_ROOMS.filter((room) => {
    if (type === "free" && room.isPaid) return false;
    if (type === "paid" && !room.isPaid) return false;
    if (q && !(room.title ?? "").includes(q)) return false;
    return true;
  });

  if (sort === "popular") {
    items = [...items].sort((a, b) => (b.participantCount ?? 0) - (a.participantCount ?? 0));
  }

  const page = items.slice(cursor, cursor + PUBLIC_PAGE_SIZE);
  const next = cursor + PUBLIC_PAGE_SIZE;
  const hasNext = next < items.length;

  return { items: page, nextCursor: hasNext ? String(next) : null, hasNext };
}

/**
 * POST /rooms/{roomId}/participants — 닉네임 중복이면 Conflict(NICKNAME_DUPLICATED).
 * 회원(access 토큰 있음)이면 participantToken 없음, 게스트면 "mock-guest-token".
 */
export function mockJoinRoom(_roomId: string, body: JoinRoomRequest): JoinRoomResponse {
  if (participants.some((p) => p.nickname === body.nickname)) {
    throw new AppError("Conflict", { code: "NICKNAME_DUPLICATED" });
  }

  const participantId = nextParticipantId++;
  const avatarId = body.avatarId ?? randomAvatarId();
  const isMember = useAuthStore.getState().accessToken !== null;

  participants = [
    ...participants,
    { participantId, nickname: body.nickname, avatarId, isGuest: !isMember },
  ];

  emitMockEvent({
    type: "PARTICIPANT_JOINED",
    ts: new Date().toISOString(),
    data: {
      participantId,
      nickname: body.nickname,
      isGuest: !isMember,
      avatarId,
      count: participants.length,
    },
  });

  return { participantId, participantToken: isMember ? undefined : "mock-guest-token", avatarId };
}

/** GET /rooms/{roomId}/participants — 초기 로딩·재접속 복구용 */
export function mockParticipants(): ParticipantsResponse {
  return { participants };
}

/** DELETE /rooms/{roomId}/participants/me */
export function mockLeaveRoom(): undefined {
  return undefined;
}
