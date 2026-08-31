import type { QuestionType, RankingEntry } from "./dto";

/** STOMP 프레임 envelope. type·ts 없으면 폐기 */
export type ServerEventFrame = { type: string; ts: string; data?: unknown };

/** 계약 이벤트 19종 — type 문자열은 KMP 코드 기준(SESSION_STARTED/SESSION_ENDED/HINT_PUBLISHED) */
export type ServerEvent =
  | {
      type: "PARTICIPANT_JOINED";
      ts: string;
      data: {
        participantId: number;
        nickname: string;
        isGuest: boolean;
        avatarId?: number | null;
        count: number;
      };
    }
  | {
      type: "PARTICIPANT_LEFT";
      ts: string;
      data: { participantId: number; count: number; reason?: "LEFT" | "KICKED" | null };
    }
  | { type: "SESSION_STARTED"; ts: string; data: { sessionId: number; questionCount: number } }
  | {
      type: "QUESTION_STARTED";
      ts: string;
      data: {
        questionId: number;
        questionNo: number;
        type: QuestionType;
        body: string;
        choices?: string[] | null;
        points: number;
        timeLimitSec: number;
        endsAt: string;
      };
    }
  | {
      type: "ANSWER_SUBMITTED";
      ts: string;
      data: { questionNo: number; submittedCount: number; totalCount: number };
    }
  | {
      type: "QUESTION_ENDED";
      ts: string;
      data: {
        questionNo: number;
        answerReveal: { answer?: string | null; explanation?: string | null };
        correctCount: number;
      };
    }
  | {
      type: "SCORE_UPDATED";
      ts: string;
      data: {
        questionNo: number;
        scores: { participantId: number; delta: number; total: number }[];
      };
    }
  | { type: "RANKING_UPDATED"; ts: string; data: { ranking: RankingEntry[] } }
  | { type: "SCREEN_LOCKED"; ts: string; data: { locked: boolean } }
  | {
      type: "HINT_PUBLISHED";
      ts: string;
      data: { hintId: number; questionNo: number; clipUrl: string; durationMs: number };
    }
  | {
      type: "SESSION_ENDED";
      ts: string;
      data: { sessionId: number; finalRanking: RankingEntry[]; reportReady?: boolean };
    }
  | { type: "REPORT_READY"; ts: string; data: { sessionId: number } }
  | { type: "ROOM_CANCELLED"; ts: string; data: { reason?: string | null } }
  | { type: "FEEDBACK_READY"; ts: string; data: { answerId: number; questionNo: number } }
  | { type: "FEEDBACK_FAILED"; ts: string; data: { answerId: number; questionNo: number } }
  | { type: "REVIEW_RECEIVED"; ts: string; data: { answerId: number; questionNo: number } }
  | {
      type: "SUBMISSION_UPDATED";
      ts: string;
      data: { questionNo: number; submittedCount: number; totalCount: number };
    }
  | { type: "PROJECTOR_CONNECTED"; ts: string; data: Record<string, never> }
  | { type: "PROJECTOR_DISCONNECTED"; ts: string; data: Record<string, never> };

export type ServerEventType = ServerEvent["type"];

export const SERVER_EVENT_TYPES: readonly ServerEventType[] = [
  "PARTICIPANT_JOINED",
  "PARTICIPANT_LEFT",
  "SESSION_STARTED",
  "QUESTION_STARTED",
  "ANSWER_SUBMITTED",
  "QUESTION_ENDED",
  "SCORE_UPDATED",
  "RANKING_UPDATED",
  "SCREEN_LOCKED",
  "HINT_PUBLISHED",
  "SESSION_ENDED",
  "REPORT_READY",
  "ROOM_CANCELLED",
  "FEEDBACK_READY",
  "FEEDBACK_FAILED",
  "REVIEW_RECEIVED",
  "SUBMISSION_UPDATED",
  "PROJECTOR_CONNECTED",
  "PROJECTOR_DISCONNECTED",
];

/** 알 수 없는 type·ts 누락은 null (폐기). data 없으면 {} */
export function parseServerEvent(raw: unknown): ServerEvent | null {
  if (typeof raw !== "object" || raw === null) return null;
  const frame = raw as Partial<ServerEventFrame>;
  if (typeof frame.type !== "string" || typeof frame.ts !== "string") return null;
  if (!SERVER_EVENT_TYPES.includes(frame.type as ServerEventType)) return null;
  return { type: frame.type, ts: frame.ts, data: frame.data ?? {} } as ServerEvent;
}
