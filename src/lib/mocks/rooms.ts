import { parseServerDateTime } from "@/lib/datetime";
import { useAuthStore } from "@/lib/stores/auth-store";
import { AppError } from "@/lib/types/app-error";
import { AVATAR_KEYS, type AvatarKey, PAYMENT_POLICY } from "@/lib/types/dto";
import { ERROR_CODES } from "@/lib/types/error-codes";
import type {
  HostedRoomsResponse,
  JoinRoomRequest,
  JoinRoomResponse,
  NicknameCheckResponse,
  PageResponse,
  ParticipantResponse,
  PublicRoomResponse,
  QuestionTimeEntry,
  RoomCreateRequest,
  RoomQuestionTimesRequest,
  RoomQuestionTimesResponse,
  RoomResponse,
  RoomSummaryResponse,
  RoomUpdateRequest,
} from "@/lib/types/dto";
import { DEMO_ROOM, HOSTED_ROOMS, PARTICIPANTS, PUBLIC_ROOMS } from "./fixtures";
import { findSetQuestions } from "./question-sets";

/** 서버 `PolicyProperties`가 검증하는 참가비 범위 — 목도 같은 값으로 막는다 */
const { min: ENTRY_FEE_MIN, max: ENTRY_FEE_MAX } = PAYMENT_POLICY.entryFee;
import { currentProfile } from "./me";

/** 방(rooms) 도메인 목 응답. 입장 인원 등 상태가 필요한 값은 모듈 스코프에서 유지한다. */

let hostedRooms: HostedRoomsResponse = {
  reputation: HOSTED_ROOMS.reputation,
  active: [...HOSTED_ROOMS.active],
  ended: [...HOSTED_ROOMS.ended],
};
let nextHostedRoomId = 105;

/** 만들어진 방 — 서버와 같은 `RoomResponse` 형태로 들고 있는다(PIN 조회·상세·수정이 같은 출처를 본다) */
let rooms: RoomResponse[] = [{ ...DEMO_ROOM }];

let participants: ParticipantResponse[] = [...PARTICIPANTS];
let nextParticipantId = 17;

/** 방이 덮어쓴 문항별 시간 — 서버 `room.question_time_overrides`·`question_auto_advance`. roomId → 항목 */
let questionTimes = new Map<number, QuestionTimeEntry[]>();

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
 * 서버처럼 세트 요약(문항 수·예상 소요·제한시간 범위)을 응답 시점에 계산해 얹는다 —
 * 방이 덮어쓴 문항별 시간이 있으면 그쪽 값으로 센다. 세트가 없으면 네 필드가 빠진다.
 */
function withSetSummary(room: RoomResponse): RoomResponse {
  if (room.questionSetId === undefined) return room;
  const overrides = new Map(
    (questionTimes.get(room.id) ?? []).map((t) => [t.questionId, t.timeLimitSec]),
  );
  const seconds = findSetQuestions(room.questionSetId).map(
    (q) => overrides.get(q.id) ?? q.timeLimitSec,
  );
  if (seconds.length === 0) return room;
  return {
    ...room,
    questionCount: seconds.length,
    estimatedSeconds: seconds.reduce((sum, s) => sum + s, 0),
    minTimeLimitSec: Math.min(...seconds),
    maxTimeLimitSec: Math.max(...seconds),
  };
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
 * POST /rooms — FREE·PAID를 연다. BRANDED만 400 `UNSUPPORTED_ROOM_TYPE`이다.
 *
 * PAID는 `fee` 필수이고 범위를 벗어나면 400이다. FREE에 `fee`를 실어 보내도 400 —
 * 서버 `PolicyProperties`가 검증하므로 안내 문구는 이 `message`를 그대로 쓴다.
 * 등급(Lv.3) 검증은 서버가 실제 이력으로 판정하므로 목에서는 통과시킨다.
 */
export function mockCreateRoom(body: RoomCreateRequest): RoomResponse {
  if (body.type === "BRANDED") {
    throw new AppError("ValidationFailed", {
      code: ERROR_CODES.UNSUPPORTED_ROOM_TYPE,
      status: 400,
    });
  }

  const isPaid = body.type === "PAID";

  if (isPaid && (body.fee == null || body.fee < ENTRY_FEE_MIN || body.fee > ENTRY_FEE_MAX)) {
    throw new AppError("ValidationFailed", {
      code: ERROR_CODES.INVALID_INPUT,
      status: 400,
      serverMessage: `참가비는 ${ENTRY_FEE_MIN.toLocaleString("ko-KR")} ~ ${ENTRY_FEE_MAX.toLocaleString("ko-KR")} C 사이여야 합니다.`,
    });
  }
  if (!isPaid && body.fee != null) {
    throw new AppError("ValidationFailed", {
      code: ERROR_CODES.INVALID_INPUT,
      status: 400,
      serverMessage: "무료 방에는 참가비를 설정할 수 없습니다.",
    });
  }

  const room: RoomResponse = {
    id: nextHostedRoomId++,
    title: body.title,
    ...(body.description ? { description: body.description } : {}),
    ...(body.topic ? { topic: body.topic } : {}),
    pin: randomPin(),
    status: "WAITING",
    type: isPaid ? "PAID" : "FREE",
    ...(isPaid && body.fee != null ? { fee: body.fee } : {}),
    ...(body.questionSetId ? { questionSetId: body.questionSetId } : {}),
    hostUserId: currentProfile().id,
    host: { userId: currentProfile().id, nickname: currentProfile().nickname },
    ...(body.maxParticipants ? { maxParticipants: body.maxParticipants } : {}),
    participantCount: 0,
    isPublic: body.isPublic ?? false,
    screenLocked: false,
    currentQuestionNo: 0,
    ...(body.scheduledAt ? { scheduledAt: body.scheduledAt } : {}),
  };

  rooms = [room, ...rooms];
  hostedRooms = {
    ...hostedRooms,
    active: [
      {
        roomId: room.id,
        title: room.title,
        pin: room.pin,
        status: "WAITING",
        ...(room.scheduledAt ? { scheduledAt: room.scheduledAt } : {}),
        participantCount: 0,
        currentQuestionNo: 0,
      },
      ...hostedRooms.active,
    ],
  };

  return withSetSummary(room);
}

/** GET /rooms/{roomId} — 호스트용 방 상세. 세트 요약은 응답 시점에 계산한다 */
export function mockRoom(roomId: string): RoomResponse {
  return withSetSummary(findRoom(roomId));
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
  // 세트가 바뀌면 덮어쓴 시간은 예전 세트의 questionId를 가리킨다 — 서버처럼 비운다
  if (body.questionSetId !== undefined && body.questionSetId !== room.questionSetId) {
    questionTimes.delete(room.id);
  }
  return withSetSummary(updated);
}

/**
 * GET /rooms/{roomId}/question-times — 세트 문항 + 이 방이 덮어쓴 값. 호스트만.
 * 정답·해설은 싣지 않는다. 세트를 아직 연결하지 않았으면 409 `QUESTION_SET_REQUIRED`.
 */
export function mockQuestionTimes(roomId: string): RoomQuestionTimesResponse {
  const room = findRoom(roomId);
  if (room.questionSetId === undefined)
    throw new AppError("Conflict", { code: ERROR_CODES.QUESTION_SET_REQUIRED });

  const overrides = new Map((questionTimes.get(room.id) ?? []).map((t) => [t.questionId, t]));
  const questions = findSetQuestions(room.questionSetId).map((q) => {
    const override = overrides.get(q.id);
    return {
      questionId: q.id,
      orderNo: q.orderNo,
      type: q.type,
      content: q.content,
      defaultTimeLimitSec: q.timeLimitSec,
      timeLimitSec: override?.timeLimitSec ?? q.timeLimitSec,
      overridden: override !== undefined,
      // 서버 기본이 켬이다(2026-09-08) — 설정을 안 만진 문항도 자동으로 넘어간다
      autoAdvance: override?.autoAdvance ?? true,
    };
  });
  return {
    roomId: room.id,
    questionSetId: room.questionSetId,
    estimatedSeconds: questions.reduce((sum, q) => sum + q.timeLimitSec, 0),
    questions,
  };
}

/**
 * PUT /rooms/{roomId}/question-times — **전체 교체**. 본문에 없는 문항은 세트 기본값으로 돌아간다.
 * WAITING일 때만(409 `CONFLICT`). 응답은 조회와 같은 모양.
 */
export function mockUpdateQuestionTimes(
  roomId: string,
  body: RoomQuestionTimesRequest,
): RoomQuestionTimesResponse {
  const room = findRoom(roomId);
  if (room.status !== "WAITING")
    throw new AppError("Conflict", {
      code: ERROR_CODES.CONFLICT,
      serverMessage: "문항별 시간은 대기 중일 때만 바꿀 수 있습니다.",
    });
  // 세트에 없는 문항은 서버가 400으로 거른다 — 목은 계약 밖 바디(`{}`)에도 TypeError 없이 응답한다
  questionTimes.set(room.id, body.times ?? []);
  return mockQuestionTimes(roomId);
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
  return withSetSummary(closed);
}

/** GET /users/me/rooms/hosted — 페이지 없이 명성 요약 + 진행 중·종료 방 */
export function mockHostedRooms(): HostedRoomsResponse {
  return hostedRooms;
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
  // 서버처럼 방의 인원도 올린다 — 목록은 2명인데 입장 화면은 0명이던 목 불일치(2026-09-08)
  room.participantCount += 1;

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
  hostedRooms = {
    reputation: HOSTED_ROOMS.reputation,
    active: [...HOSTED_ROOMS.active],
    ended: [...HOSTED_ROOMS.ended],
  };
  participants = [...PARTICIPANTS];
  questionTimes = new Map();
  nextHostedRoomId = 105;
  nextParticipantId = 17;
}
