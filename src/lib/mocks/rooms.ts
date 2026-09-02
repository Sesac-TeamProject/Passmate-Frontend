import { parseServerDateTime } from "@/lib/datetime";
import { useAuthStore } from "@/lib/stores/auth-store";
import { AppError } from "@/lib/types/app-error";
import { AVATAR_KEYS, type AvatarKey } from "@/lib/types/dto";
import { ERROR_CODES } from "@/lib/types/error-codes";
import type {
  HostedRoomDto,
  HostedRoomsResponse,
  JoinRoomRequest,
  JoinRoomResponse,
  NicknameCheckResponse,
  PageResponse,
  ParticipantResponse,
  PublicRoomResponse,
  RoomCreateRequest,
  RoomResponse,
  RoomSummaryResponse,
  RoomUpdateRequest,
} from "@/lib/types/dto";
import { DEMO_ROOM, HOSTED_ROOMS, PARTICIPANTS, PUBLIC_ROOMS } from "./fixtures";
import { currentProfile } from "./me";

/** 방(rooms) 도메인 목 응답. 입장 인원 등 상태가 필요한 값은 모듈 스코프에서 유지한다. */

let hostedRooms: HostedRoomDto[] = [...HOSTED_ROOMS];
let nextHostedRoomId = 104;

/** 만들어진 방 — 서버와 같은 `RoomResponse` 형태로 들고 있는다(PIN 조회·상세·수정이 같은 출처를 본다) */
let rooms: RoomResponse[] = [{ ...DEMO_ROOM }];

let participants: ParticipantResponse[] = [...PARTICIPANTS];
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
 * GET /rooms/pin/{pin} — 인증 불필요. **입장 전에는 많이 알려주지 않는다**:
 * PIN·호스트·문항 수는 응답에 없다. 없는 PIN·끝난 방 모두 404 `ROOM_NOT_FOUND`(410이 아니다).
 */
export function mockRoomByPin(pin: string): RoomSummaryResponse {
  const room = rooms.find((r) => r.pin === pin);
  if (!room || room.status === "ENDED" || room.status === "CANCELED")
    throw new AppError("NotFound", { code: ERROR_CODES.ROOM_NOT_FOUND });

  return {
    id: room.id,
    title: room.title,
    ...(room.topic ? { topic: room.topic } : {}),
    status: room.status,
    type: room.type,
    ...(room.fee !== undefined ? { fee: room.fee } : {}),
    participantCount: room.participantCount,
    ...(room.maxParticipants !== undefined ? { maxParticipants: room.maxParticipants } : {}),
    guestAllowed: room.type === "FREE",
  };
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

/** 오늘 안에 시작하는 방인가 (`today=true` 필터) */
function isToday(scheduledAt: string | undefined): boolean {
  if (!scheduledAt) return false;
  const at = parseServerDateTime(scheduledAt);
  const now = new Date();
  return (
    at.getFullYear() === now.getFullYear() &&
    at.getMonth() === now.getMonth() &&
    at.getDate() === now.getDate()
  );
}

/**
 * GET /rooms/public — enum은 **대문자**, 페이지는 오프셋이다.
 * `sort=POPULAR`면 참여 인원 내림차순, `UPCOMING`이면 예정 시각 오름차순.
 */
export function mockPublicRooms(url: URL): PageResponse<PublicRoomResponse> {
  const type = url.searchParams.get("type");
  const sort = url.searchParams.get("sort") ?? "POPULAR";
  const status = url.searchParams.get("status");
  const today = url.searchParams.get("today") === "true";
  const q = url.searchParams.get("q");
  const page = Number(url.searchParams.get("page") ?? 0) || 0;
  const size = Number(url.searchParams.get("size") ?? PUBLIC_PAGE_SIZE) || PUBLIC_PAGE_SIZE;

  let items = PUBLIC_ROOMS.filter((room) => {
    if (type && room.type !== type) return false;
    if (status && room.status !== status) return false;
    if (today && !isToday(room.scheduledAt)) return false;
    if (q && !room.title.includes(q)) return false;
    return true;
  });

  items =
    sort === "UPCOMING"
      ? [...items].sort((a, b) => (a.scheduledAt ?? "9").localeCompare(b.scheduledAt ?? "9"))
      : [...items].sort((a, b) => b.participantCount - a.participantCount);

  const content = items.slice(page * size, page * size + size);

  return {
    content,
    page,
    size,
    totalElements: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / size)),
    hasNext: (page + 1) * size < items.length,
  };
}

/**
 * POST /rooms/{roomId}/participants — 닉네임이 겹치면 409 `NICKNAME_DUPLICATED`.
 *
 * **게스트에게만 토큰 두 개를 준다**: `accessToken`(이후 Bearer)과 `guestToken`(기록 이관용).
 * 회원으로 들어오면 둘 다 주지 않는다 — 이미 회원 토큰이 있다.
 */
export function mockJoinRoom(roomId: string, body: JoinRoomRequest): JoinRoomResponse {
  const room = findRoom(roomId);
  if (participants.some((p) => p.nickname === body.nickname)) {
    throw new AppError("Conflict", { code: ERROR_CODES.NICKNAME_DUPLICATED });
  }
  if (room.maxParticipants !== undefined && participants.length >= room.maxParticipants) {
    throw new AppError("Conflict", { code: ERROR_CODES.ROOM_FULL });
  }

  const participant: ParticipantResponse = {
    id: nextParticipantId++,
    nickname: body.nickname,
    avatarId: body.avatarId ?? randomAvatarId(),
    isGuest: useAuthStore.getState().accessToken === null,
    joinedAt: new Date().toISOString().slice(0, 19),
  };
  participants = [...participants, participant];

  return participant.isGuest
    ? { participant, accessToken: "mock-guest-access-token", guestToken: "mock-guest-record-token" }
    : { participant };
}

/** GET /rooms/{roomId}/participants — **배열 그대로**(래퍼 없음) */
export function mockParticipants(): ParticipantResponse[] {
  return participants;
}

/** GET /rooms/{roomId}/participants/nickname-check — 겹치면 대안 3개를 준다 */
export function mockCheckNickname(_roomId: string, nickname: string): NicknameCheckResponse {
  const taken = participants.some((p) => p.nickname === nickname);
  return {
    available: !taken,
    suggestions: taken ? [1, 2, 3].map((n) => `${nickname}${n}`) : [],
  };
}

/** DELETE /rooms/{roomId}/participants/me */
export function mockLeaveRoom(): undefined {
  return undefined;
}

/** DELETE /rooms/{roomId}/participants/{participantId} — 호스트가 내보낸다 */
export function mockKickParticipant(_roomId: string, participantId: string): undefined {
  const id = Number(participantId);
  if (!participants.some((p) => p.id === id))
    throw new AppError("NotFound", { code: ERROR_CODES.PARTICIPANT_NOT_FOUND });

  participants = participants.filter((p) => p.id !== id);
  return undefined;
}

/**
 * 테스트 전용 — 모듈 스코프 상태를 처음으로 되돌린다.
 * 방을 닫거나 참가자를 넣는 목이 테스트 사이에 남으면(예: 닫힌 방의 PIN은 404) 다음 테스트가
 * 순서 때문에 실패한다.
 */
export function __resetRoomsForTests(): void {
  rooms = [{ ...DEMO_ROOM }];
  hostedRooms = [...HOSTED_ROOMS];
  participants = [...PARTICIPANTS];
  nextHostedRoomId = 104;
  nextParticipantId = 17;
}
