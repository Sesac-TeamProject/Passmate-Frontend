import { useAuthStore } from "@/lib/stores/auth-store";
import { AppError } from "@/lib/types/app-error";
import { AVATAR_KEYS, type AvatarKey } from "@/lib/types/dto";
import { ERROR_CODES } from "@/lib/types/error-codes";
import type {
  HostedRoomDto,
  HostedRoomsResponse,
  JoinRoomRequest,
  JoinRoomResponse,
  ParticipantEntry,
  ParticipantsResponse,
  PublicRoomPageResponse,
  RoomCreateRequest,
  RoomInfoResponse,
  RoomResponse,
  RoomUpdateRequest,
} from "@/lib/types/dto";
import { DEMO_ROOM, DEMO_ROOM_HOST, HOSTED_ROOMS, PARTICIPANTS, PUBLIC_ROOMS } from "./fixtures";
import { currentProfile } from "./me";
import { emitMockEvent } from "./session";

/** 방(rooms) 도메인 목 응답. 입장 인원 등 상태가 필요한 값은 모듈 스코프에서 유지한다. */

let hostedRooms: HostedRoomDto[] = [...HOSTED_ROOMS];
let nextHostedRoomId = 104;

/** 만들어진 방 — 서버와 같은 `RoomResponse` 형태로 들고 있는다(PIN 조회·상세·수정이 같은 출처를 본다) */
let rooms: RoomResponse[] = [{ ...DEMO_ROOM }];

let participants: ParticipantEntry[] = [...PARTICIPANTS];
let nextParticipantId = 17;

function randomPin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function randomAvatarId(): AvatarKey {
  return AVATAR_KEYS[Math.floor(Math.random() * AVATAR_KEYS.length)];
}

function findRoom(roomId: string): RoomResponse {
  const found = rooms.find((r) => r.id === Number(roomId));
  if (!found) throw new AppError("NotFound", { code: ERROR_CODES.ROOM_NOT_FOUND });
  return found;
}

/**
 * @draft 입장 화면이 아직 기대하는 옛 형태로 접어 준다.
 * 서버 `GET /rooms/pin/{pin}`은 `RoomSummaryResponse`(호스트·문항 수 없음)를 준다 —
 * US2(T036·T044)에서 이 변환을 걷어낸다.
 */
function toRoomInfo(room: RoomResponse): RoomInfoResponse {
  return {
    roomId: room.id,
    pin: room.pin,
    title: room.title,
    topic: room.topic ?? null,
    status: room.status,
    questionCount: null,
    questionSetId: room.questionSetId ?? null,
    estimatedMinutes: null,
    scheduledAt: room.scheduledAt ?? null,
    participantCount: room.participantCount,
    maxParticipants: room.maxParticipants ?? null,
    isPaid: room.type === "PAID",
    entryFee: room.fee ?? null,
    host: room.hostUserId === DEMO_ROOM_HOST.userId ? { ...DEMO_ROOM_HOST } : null,
  };
}

/**
 * GET /rooms/pin/{pin} — 없는 PIN·끝난 방 모두 404 `ROOM_NOT_FOUND`(410이 아니다).
 */
export function mockRoomByPin(pin: string): RoomInfoResponse {
  const found = rooms.find((room) => room.pin === pin);
  if (!found) throw new AppError("NotFound", { code: ERROR_CODES.ROOM_NOT_FOUND });
  return toRoomInfo(found);
}

/**
 * POST /rooms — 서버는 무료 방만 연다. PAID·BRANDED는 400 `UNSUPPORTED_ROOM_TYPE`이다
 * (등급으로 막는 게 아니다 — 유료 방 자체가 아직 없다).
 */
export function mockCreateRoom(body: RoomCreateRequest): RoomResponse {
  if (body.type && body.type !== "FREE") {
    throw new AppError("ValidationFailed", { code: ERROR_CODES.UNSUPPORTED_ROOM_TYPE });
  }

  const room: RoomResponse = {
    id: nextHostedRoomId++,
    title: body.title,
    ...(body.description ? { description: body.description } : {}),
    ...(body.topic ? { topic: body.topic } : {}),
    pin: randomPin(),
    status: "WAITING",
    type: "FREE",
    ...(body.questionSetId ? { questionSetId: body.questionSetId } : {}),
    hostUserId: currentProfile().id,
    ...(body.maxParticipants ? { maxParticipants: body.maxParticipants } : {}),
    participantCount: 0,
    isPublic: body.isPublic ?? false,
    screenLocked: false,
    currentQuestionNo: 0,
    ...(body.scheduledAt ? { scheduledAt: body.scheduledAt } : {}),
  };

  rooms = [room, ...rooms];
  hostedRooms = [
    {
      roomId: room.id,
      pin: room.pin,
      title: room.title,
      status: "WAITING",
      participantCount: 0,
      scheduledAt: room.scheduledAt ?? null,
      endedAtLabel: null,
      avgAccuracyPercent: null,
    },
    ...hostedRooms,
  ];

  return room;
}

/** GET /rooms/{roomId} — 호스트용 방 상세 */
export function mockRoom(roomId: string): RoomResponse {
  return { ...findRoom(roomId) };
}

/** PUT /rooms/{roomId} — WAITING일 때만 */
export function mockUpdateRoom(roomId: string, body: RoomUpdateRequest): RoomResponse {
  const room = findRoom(roomId);
  if (room.status !== "WAITING")
    throw new AppError("Conflict", { code: ERROR_CODES.ROOM_NOT_JOINABLE });

  const updated: RoomResponse = {
    ...room,
    title: body.title,
    ...(body.description !== undefined ? { description: body.description } : {}),
    ...(body.topic !== undefined ? { topic: body.topic } : {}),
    ...(body.questionSetId !== undefined ? { questionSetId: body.questionSetId } : {}),
    ...(body.maxParticipants !== undefined ? { maxParticipants: body.maxParticipants } : {}),
    isPublic: body.isPublic ?? room.isPublic,
    ...(body.scheduledAt !== undefined ? { scheduledAt: body.scheduledAt } : {}),
  };
  rooms = rooms.map((r) => (r.id === room.id ? updated : r));
  return updated;
}

/** POST /rooms/{roomId}/close — WAITING이면 CANCELED, RUNNING이면 ENDED */
export function mockCloseRoom(roomId: string): RoomResponse {
  const room = findRoom(roomId);
  const closed: RoomResponse = {
    ...room,
    status: room.status === "RUNNING" ? "ENDED" : "CANCELED",
    endedAt: new Date().toISOString().slice(0, 19),
  };
  rooms = rooms.map((r) => (r.id === room.id ? closed : r));
  return closed;
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
