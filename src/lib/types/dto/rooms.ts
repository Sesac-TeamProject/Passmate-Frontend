import type { AvatarKey, CursorPage, HostLevel, RoomStatus, RoomType } from "./common";

/**
 * 방·참가자 — 백엔드 `room/dto/*.kt` 1:1 (`contracts/rest-api.md` §2-5).
 *
 * **식별자 주의**: 프런트 라우트 `[code]`는 PIN이지만 **모든 API는 숫자 `roomId`** 를 받는다.
 * `GET /rooms/pin/{pin}`으로 `id`를 얻어 쓴다(`data-model.md` §2-3).
 */

/**
 * POST /rooms — 확정(CONFIRMED) 세트만 연결할 수 있다.
 * `type`을 PAID·BRANDED로 보내면 400 `UNSUPPORTED_ROOM_TYPE`(서버가 아직 무료 방만 연다).
 */
export type RoomCreateRequest = {
  /** ≤100자 */
  title: string;
  /** 생략하면 FREE */
  type?: RoomType;
  /** ≤500자 */
  description?: string;
  /** ≤50자 */
  topic?: string;
  questionSetId?: number;
  /** 코인(1 C = ₩1). 유료 방이 열리기 전까지는 서버가 받지 않는다 */
  fee?: number;
  /** 1~1000 */
  maxParticipants?: number;
  /** 공개 방 목록(`GET /rooms/public`) 노출 여부. 생략하면 false */
  isPublic?: boolean;
  /** UTC naive (`toServerDateTime`으로 만든다) */
  scheduledAt?: string;
};

/** PUT /rooms/{roomId} — WAITING일 때만. `type`·`fee`는 바꿀 수 없다 */
export type RoomUpdateRequest = {
  title: string;
  description?: string;
  topic?: string;
  questionSetId?: number;
  maxParticipants?: number;
  isPublic?: boolean;
  scheduledAt?: string;
};

/** POST /rooms · GET /rooms/{roomId} · PUT /rooms/{roomId} · POST /rooms/{roomId}/close 응답 */
export type RoomResponse = {
  id: number;
  title: string;
  description?: string;
  topic?: string;
  /** 6자리. 활성 방 사이에서만 유일하고 종료 후 재사용된다 */
  pin: string;
  status: RoomStatus;
  type: RoomType;
  fee?: number;
  questionSetId?: number;
  hostUserId: number;
  maxParticipants?: number;
  participantCount: number;
  isPublic: boolean;
  screenLocked: boolean;
  /** 0이면 아직 시작 전 */
  currentQuestionNo: number;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
};

/**
 * GET /rooms/pin/{pin} — **인증 없이** 부를 수 있는 입장 전 정보.
 * `pin`·호스트·문항 수는 들어 있지 않다(입장 전에는 알려주지 않는다).
 * 종료·취소된 방의 PIN도 404 `ROOM_NOT_FOUND`다 — 410 분기는 없다(백엔드 질문 B-4).
 */
export type RoomSummaryResponse = {
  id: number;
  title: string;
  topic?: string;
  status: RoomStatus;
  type: RoomType;
  fee?: number;
  participantCount: number;
  maxParticipants?: number;
  /** 무료 방이면 true — 게스트(비회원)로 들어갈 수 있다 */
  guestAllowed: boolean;
};

/* ────────────────────────── 아래는 US2에서 교체 예정 ────────────────────────── */

/** @deprecated US2(T036)에서 `RoomSummaryResponse`로 교체한다 */
export type RoomInfoHost = {
  userId?: number | null;
  nickname: string;
  level?: HostLevel | null;
  avgStars?: number | null;
  ratingCount?: number | null;
};
/** @deprecated US2(T036)에서 `RoomSummaryResponse`로 교체한다 */
export type RoomInfoResponse = {
  roomId: number;
  pin: string;
  title: string;
  topic?: string | null;
  status?: RoomStatus | null;
  questionCount?: number | null;
  questionSetId?: number | null;
  estimatedMinutes?: number | null;
  scheduledAt?: string | null;
  participantCount?: number | null;
  maxParticipants?: number | null;
  isPaid?: boolean;
  entryFee?: number | null;
  host?: RoomInfoHost | null;
};

/** @deprecated US2(T036)에서 `JoinRoomRequest{nickname, avatarId?, deviceKey?}`로 교체한다 */
export type JoinRoomRequest = { nickname: string; avatarId?: AvatarKey | null };
/** @deprecated US2(T036)에서 `{participant, accessToken?, guestToken?}`로 교체한다 */
export type JoinRoomResponse = {
  participantId: number;
  participantToken?: string | null;
  avatarId?: AvatarKey | null;
};

/** @deprecated US2(T036)에서 `ParticipantResponse`로 교체한다 */
export type ParticipantEntry = {
  participantId: number;
  nickname: string;
  avatarId?: AvatarKey | null;
  isGuest?: boolean;
  isConnected?: boolean;
};
/** @deprecated US2(T036)에서 배열 응답으로 교체한다 */
export type ParticipantsResponse = { participants?: ParticipantEntry[] };

/** @deprecated US9(T092)에서 `{reputation, active, ended}`로 교체한다 */
export type HostedRoomDto = {
  roomId?: number;
  pin?: string;
  title?: string;
  status?: RoomStatus | null;
  participantCount?: number | null;
  scheduledAt?: string | null;
  endedAtLabel?: string | null;
  avgAccuracyPercent?: number | null;
};
/** @deprecated US9(T092)에서 페이지 없는 응답으로 교체한다 */
export type HostedRoomsResponse = CursorPage<HostedRoomDto>;

/** @deprecated US2(T036)에서 `PublicRoomResponse`로 교체한다 */
export type PublicRoomDto = {
  roomId?: number;
  pin?: string;
  title?: string;
  topic?: string | null;
  hostId?: number | null;
  hostName?: string;
  hostLevel?: HostLevel | null;
  hostRating?: number | null;
  status?: RoomStatus | null;
  participantCount?: number | null;
  maxParticipants?: number | null;
  isPaid?: boolean;
  entryFee?: number | null;
  scheduledAt?: string | null;
};
/** @deprecated US2(T036)에서 `PageResponse<PublicRoomResponse>`로 교체한다 */
export type PublicRoomPageResponse = CursorPage<PublicRoomDto>;
/** @deprecated US2(T036)에서 대문자 enum으로 교체한다 */
export type PublicRoomSort = "popular" | "upcoming";
/** @deprecated US2(T036)에서 대문자 enum으로 교체한다 */
export type PublicRoomType = "all" | "free" | "paid";
/** @deprecated US2(T036)에서 `PublicRoomSearch`로 교체한다 */
export type PublicRoomsQuery = {
  sort: PublicRoomSort;
  type: PublicRoomType;
  q?: string;
  cursor?: string;
};
