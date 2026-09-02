import type { CursorPage, RoomStatus, RoomType } from "./common";

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

/** POST /rooms/{roomId}/participants — 인증은 선택. 무인증이면 게스트로 들어간다 */
export type JoinRoomRequest = {
  /** ≤30자, 방 안에서 유일해야 한다 */
  nickname: string;
  /** 12종 아바타 키. 생략하면 서버가 회원 기본값 또는 `"default"`를 넣는다 */
  avatarId?: string;
  /** 같은 기기 재입장 식별용(≤64자). 지금 웹은 보내지 않는다 */
  deviceKey?: string;
};

/** 참가자 한 명 — 접속 여부(`isConnected`)는 서버가 주지 않는다 */
export type ParticipantResponse = {
  id: number;
  nickname: string;
  avatarId: string;
  isGuest: boolean;
  joinedAt: string;
};

/**
 * POST /rooms/{roomId}/participants 응답.
 *
 * **토큰이 둘이다**(게스트만 받는다, `research.md` R-6):
 * - `accessToken` — 게스트 JWT. 이후 요청·STOMP CONNECT의 **Bearer**다(1시간, refresh 없음)
 * - `guestToken` — 32자 hex. 나중에 가입할 때 기록을 옮기는 표
 *
 * 둘을 하나로 다루면 게스트의 모든 요청이 401이 된다.
 */
export type JoinRoomResponse = {
  participant: ParticipantResponse;
  accessToken?: string;
  guestToken?: string;
};

/** GET /rooms/{roomId}/participants/nickname-check?nickname= — 인증 불필요 */
export type NicknameCheckResponse = { available: boolean; suggestions: string[] };

/** 공개 방 목록의 호스트 — 등급·별점은 없다(서버가 아직 계산하지 않는다) */
export type PublicRoomHostResponse = { userId: number; nickname: string };

/**
 * GET /rooms/public 항목 — 인증 불필요.
 * **PIN이 없다** — 공개 목록으로는 방을 구경만 하고, 입장하려면 PIN·QR을 받아야 한다.
 */
export type PublicRoomResponse = {
  id: number;
  title: string;
  topic?: string;
  status: RoomStatus;
  type: RoomType;
  fee?: number;
  questionCount?: number;
  participantCount: number;
  maxParticipants?: number;
  host: PublicRoomHostResponse;
  scheduledAt?: string;
  startedAt?: string;
};

/** GET /rooms/public 쿼리 — enum은 **대문자**, 페이지는 오프셋 */
export type PublicRoomSearch = {
  q?: string;
  type?: "FREE" | "PAID";
  /** 오늘 열리는 방만 */
  today?: boolean;
  status?: "WAITING" | "RUNNING";
  /** 생략하면 POPULAR */
  sort?: "POPULAR" | "UPCOMING";
  page?: number;
  /** ≤50 */
  size?: number;
};

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
