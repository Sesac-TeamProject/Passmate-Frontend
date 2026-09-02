import type {
  ParticipantResponse,
  RankingEntry,
  SessionSnapshotResponse,
  SnapshotQuestion,
  VoiceHintEntry,
} from "@/lib/types/dto";
import type { ServerEvent } from "@/lib/types/events";

export type SessionPhase = "WAITING" | "RUNNING" | "FINISHED";

export type SessionState = {
  phase: SessionPhase;
  questionCount: number | null;
  participants: ParticipantResponse[];
  currentQuestion: SnapshotQuestion | null;
  /** 서버 시각 기준 — 남은 시간은 endsAt − serverTs 로 렌더만 한다 */
  serverTs: string | null;
  submitted: { submittedCount: number; totalCount: number };
  reveal: {
    questionNo: number;
    answer: string | null;
    explanation: string | null;
    correctCount: number;
  } | null;
  ranking: RankingEntry[];
  finalRanking: RankingEntry[];
  hints: VoiceHintEntry[];
  isLocked: boolean;
  aiAnalysisEnabled: boolean;
  cancelledReason: string | null;
};

export const initialSessionState: SessionState = {
  phase: "WAITING",
  questionCount: null,
  participants: [],
  currentQuestion: null,
  serverTs: null,
  submitted: { submittedCount: 0, totalCount: 0 },
  reveal: null,
  ranking: [],
  finalRanking: [],
  hints: [],
  isLocked: false,
  aiAnalysisEnabled: true,
  cancelledReason: null,
};

export function reduceSessionEvent(state: SessionState, event: ServerEvent): SessionState {
  const base = { ...state, serverTs: event.ts };
  switch (event.type) {
    case "PARTICIPANT_JOINED": {
      const { participantId, nickname, isGuest, avatarId } = event.data;
      const rest = state.participants.filter((p) => p.id !== participantId);
      return {
        ...base,
        participants: [
          ...rest,
          {
            id: participantId,
            nickname,
            avatarId: avatarId ?? "default",
            isGuest: isGuest ?? false,
            joinedAt: event.ts,
          },
        ],
      };
    }
    case "PARTICIPANT_LEFT":
      return {
        ...base,
        participants: state.participants.filter((p) => p.id !== event.data.participantId),
      };
    case "SESSION_STARTED":
      return {
        ...base,
        phase: "RUNNING",
        questionCount: event.data.questionCount,
        currentQuestion: null,
        reveal: null,
        ranking: [],
        finalRanking: [],
      };
    case "QUESTION_STARTED": {
      const { questionId, questionNo, type, body, choices, points, timeLimitSec, endsAt } =
        event.data;
      return {
        ...base,
        phase: "RUNNING",
        currentQuestion: {
          questionId,
          questionNo,
          type,
          body,
          choices: choices ?? null,
          points,
          timeLimitSec,
          endsAt,
          isClosed: false,
        },
        submitted: { submittedCount: 0, totalCount: state.participants.length },
        reveal: null,
      };
    }
    case "ANSWER_SUBMITTED":
    case "SUBMISSION_UPDATED":
      return {
        ...base,
        submitted: { submittedCount: event.data.submittedCount, totalCount: event.data.totalCount },
      };
    case "QUESTION_ENDED":
      return {
        ...base,
        currentQuestion: state.currentQuestion
          ? { ...state.currentQuestion, isClosed: true }
          : null,
        // 서버 프레임의 중첩 필드는 계약상 필수지만 방어적으로 읽는다 — 한 프레임이 깨져도 화면이 죽지 않도록.
        reveal: {
          questionNo: event.data.questionNo,
          answer: event.data.answerReveal?.answer ?? null,
          explanation: event.data.answerReveal?.explanation ?? null,
          correctCount: event.data.correctCount ?? 0,
        },
      };
    case "SCORE_UPDATED":
      return base;
    case "RANKING_UPDATED":
      return { ...base, ranking: event.data.ranking ?? [] };
    case "SCREEN_LOCKED":
      return { ...base, isLocked: event.data.locked };
    case "HINT_PUBLISHED":
      return { ...base, hints: [...state.hints, event.data] };
    case "SESSION_ENDED":
      return {
        ...base,
        phase: "FINISHED",
        finalRanking: event.data.finalRanking ?? [],
        ranking: event.data.finalRanking ?? [],
      };
    case "ROOM_CANCELLED":
      return { ...base, cancelledReason: event.data.reason ?? "" };
    default:
      return base;
  }
}

export function applySnapshot(
  state: SessionState,
  snapshot: SessionSnapshotResponse,
): SessionState {
  const status = snapshot.status ?? "WAITING";
  return {
    ...state,
    // "ENDED"(및 그 외 WAITING·RUNNING이 아닌 값)는 SessionPhase가 3값뿐이라 의도적으로 FINISHED로 합친다
    phase: status === "RUNNING" ? "RUNNING" : status === "WAITING" ? "WAITING" : "FINISHED",
    questionCount: snapshot.questionCount ?? state.questionCount,
    currentQuestion: snapshot.currentQuestion ?? null,
    serverTs: snapshot.ts,
    ranking: snapshot.ranking ?? [],
    isLocked: snapshot.isLocked ?? false,
    reveal: null,
  };
}

/** 스냅샷보다 오래된 프레임은 폐기. 파싱 실패는 폐기하지 않는다(KMP SnapshotPolicy) */
export function isStaleFrame(frameTs: string, snapshotTs: string): boolean {
  const f = Date.parse(frameTs);
  const s = Date.parse(snapshotTs);
  if (Number.isNaN(f) || Number.isNaN(s)) return false;
  return f < s;
}
