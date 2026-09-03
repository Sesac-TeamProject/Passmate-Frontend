import type {
  ParticipantResponse,
  QuestionEndedPayload,
  QuestionStartedPayload,
  RankingEntry,
  ScreenLockPayload,
  SubmissionStatusPayload,
} from "./dto";

/**
 * STOMP 프레임 봉투 — 백엔드 `session/dto/SessionEvents.kt` 1:1 (`contracts/ws-events.md` §3).
 *
 * ```json
 * { "type": "QUESTION_STARTED", "roomId": 1, "occurredAt": "2026-09-02T02:12:49.123456", "payload": {…} }
 * ```
 *
 * 예전 판은 `{type, ts, data}`를 기대해 `ts`가 없는 실서버 프레임을 **전부 버렸다** —
 * 세션 화면이 아예 움직이지 않던 원인이다.
 * `occurredAt`은 오프셋 없는 UTC 문자열이라 `parseServerDateTime`으로 읽는다.
 * `payload`가 없는 이벤트(`SESSION_STARTED`)는 필드 자체가 빠져 온다(`non_null`).
 */
export type ServerEventFrame = {
  type: string;
  roomId: number;
  occurredAt: string;
  payload?: unknown;
};

/** 이벤트 봉투 공통부 */
type Envelope<T extends string, P> = {
  type: T;
  roomId: number;
  occurredAt: string;
  payload: P;
};

/**
 * 서버가 정의한 이벤트 **9종**(`SessionEventType.kt`).
 * 뒤 두 개(`PARTICIPANT_*`)는 enum에만 있고 **발행하는 코드가 없다** — 대기실은 폴링으로 대신한다
 * (`research.md` R-7, 백엔드 질문 B-1). 타입은 남겨 두어 서버가 발행을 넣으면 바로 받는다.
 */
export type ServerEvent =
  /** 세션 시작 직후. 페이로드 없이 온 뒤 곧바로 QUESTION_STARTED(1번)가 이어진다 */
  | Envelope<"SESSION_STARTED", undefined>
  | Envelope<"QUESTION_STARTED", QuestionStartedPayload>
  /** 문항 마감 — 여기서 처음 정답이 공개된다 */
  | Envelope<"QUESTION_ENDED", QuestionEndedPayload>
  /** 매 QUESTION_ENDED 직후. 페이로드가 배열 그 자체다 */
  | Envelope<"RANKING_UPDATED", RankingEntry[]>
  /** 호스트 토픽(/topic/rooms/{id}/host)에만 온다 */
  | Envelope<"SUBMISSION_UPDATED", SubmissionStatusPayload>
  | Envelope<"SCREEN_LOCKED", ScreenLockPayload>
  /** 최종 랭킹이 함께 온다 */
  | Envelope<"SESSION_ENDED", RankingEntry[]>
  /** @draft 서버가 아직 발행하지 않는다 */
  | Envelope<"PARTICIPANT_JOINED", ParticipantResponse>
  /** @draft 서버가 아직 발행하지 않는다 */
  | Envelope<"PARTICIPANT_LEFT", ParticipantResponse>;

export type ServerEventType = ServerEvent["type"];

export const SERVER_EVENT_TYPES: readonly ServerEventType[] = [
  "SESSION_STARTED",
  "QUESTION_STARTED",
  "QUESTION_ENDED",
  "RANKING_UPDATED",
  "SUBMISSION_UPDATED",
  "SCREEN_LOCKED",
  "SESSION_ENDED",
  "PARTICIPANT_JOINED",
  "PARTICIPANT_LEFT",
];

/**
 * 프레임 → 이벤트. 모르는 `type`이거나 봉투가 깨졌으면 null(폐기).
 *
 * `payload`는 있는 그대로 넘긴다 — 이벤트마다 모양이 달라(객체·배열·없음) 여기서 정규화하면
 * 오히려 정보가 사라진다. 값을 꺼내는 쪽(리듀서)이 방어적으로 읽는다.
 */
export function parseServerEvent(raw: unknown): ServerEvent | null {
  if (typeof raw !== "object" || raw === null) return null;

  const frame = raw as Partial<ServerEventFrame>;
  if (typeof frame.type !== "string") return null;
  if (typeof frame.occurredAt !== "string") return null;
  if (!SERVER_EVENT_TYPES.includes(frame.type as ServerEventType)) return null;

  return {
    type: frame.type,
    roomId: typeof frame.roomId === "number" ? frame.roomId : 0,
    occurredAt: frame.occurredAt,
    payload: frame.payload,
  } as ServerEvent;
}
