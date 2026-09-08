import type { QuestionType, RoomStatus, RoomType } from "./common";

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

/**
 * 호스트 명성 — **등급(`level`)·진행률·평균 별점은 서버가 아직 계산하지 않는다**(값이 빠져 온다).
 * 없으면 등급 UI를 그리지 않는다: 0·Lv.1로 채우면 "새싹 등급"이라는 없는 사실이 된다.
 */
export type HostReputation = {
  level?: number;
  /** 0~1 */
  nextLevelProgress?: number;
  hostedSessionCount: number;
  totalStudentCount: number;
  averageStars?: number;
  ratingCount: number;
};

/** 아직 열려 있는 방 — PIN이 있어 바로 대기실로 갈 수 있다 */
export type ActiveHostedRoom = {
  roomId: number;
  title: string;
  pin: string;
  status: RoomStatus;
  scheduledAt?: string;
  startedAt?: string;
  participantCount: number;
  /** 0이면 아직 시작 전 */
  currentQuestionNo: number;
};

/** 끝난 방 — PIN은 없다(활성 방 사이에서만 유일하고 종료 후 재사용된다) */
export type EndedHostedRoom = {
  roomId: number;
  title: string;
  endedAt?: string;
  studentCount: number;
  /** 0~100 */
  correctRate?: number;
  averageStars?: number;
  ratingCount: number;
};

/** GET /users/me/rooms/hosted — **페이지가 없다**. 진행 중·종료를 나눠서 준다 */
export type HostedRoomsResponse = {
  reputation: HostReputation;
  active: ActiveHostedRoom[];
  ended: EndedHostedRoom[];
};

/**
 * 방 문항별 시간(W-02b) — 백엔드 `room/dto/RoomQuestionTimeDtos.kt` 1:1.
 *
 * 방에는 확정 세트만 붙고 확정 세트의 문항은 고칠 수 없다(409). 그래서 시간은 세트가 아니라
 * **방이 덮어쓴다**(`room.question_time_overrides`) — 같은 세트를 쓰는 다른 방은 그대로다.
 * 세션 시작 시 이 값이 `session_question`으로 복사된다(백엔드 질문 B-18 결정 (b), 2026-09-07).
 */

/** 문항 하나의 제한시간·자동 넘김 */
export type QuestionTimeEntry = {
  questionId: number;
  /** 5~600 */
  timeLimitSec: number;
  /** 시간 만료로 마감되면 다음 문항을 자동으로 연다. 생략하면 false */
  autoAdvance?: boolean;
};

/**
 * PUT /rooms/{roomId}/question-times — **전체 교체**. 본문에 없는 문항은 세트 기본값으로 돌아가고
 * 자동 넘김도 꺼진다. 빈 배열이면 전부 초기화. WAITING일 때만(409 `CONFLICT`)
 */
export type RoomQuestionTimesRequest = { times: QuestionTimeEntry[] };

/** 문항 한 줄 — 세트 기본값과 이 방에서 쓸 값. 정답·해설은 오지 않는다(프로젝터에 뜰 수 있다) */
export type RoomQuestionTimeView = {
  questionId: number;
  orderNo: number;
  type: QuestionType;
  content: string;
  /** 세트에 적힌 제한시간(초) */
  defaultTimeLimitSec: number;
  /** 이 방에서 쓸 제한시간(초). 덮어쓴 값이 없으면 기본값과 같다 */
  timeLimitSec: number;
  /** 이 방에서 덮어쓴 문항인지 */
  overridden: boolean;
  autoAdvance: boolean;
};

/**
 * GET /rooms/{roomId}/question-times · PUT 응답. 호스트만.
 * 세트를 아직 연결하지 않은 방은 409 `QUESTION_SET_REQUIRED`다.
 */
export type RoomQuestionTimesResponse = {
  roomId: number;
  questionSetId: number;
  /** 이 방 기준 예상 소요 시간(초, 문항 제한시간 합) */
  estimatedSeconds: number;
  questions: RoomQuestionTimeView[];
};
