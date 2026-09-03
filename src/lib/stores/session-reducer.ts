import { parseServerDateTime } from "@/lib/datetime";
import type {
  ParticipantResponse,
  QuestionEndedPayload,
  QuestionStartedPayload,
  RankingEntry,
  RoomStatus,
  SessionSnapshotResponse,
  SubmissionStatusPayload,
  VoiceHintEntry,
} from "@/lib/types/dto";
import type { ServerEvent } from "@/lib/types/events";

/** 화면이 쓰는 단계. 서버 `RoomStatus`(4값)에서 파생한다 — ENDED·CANCELED는 둘 다 FINISHED다 */
export type SessionPhase = "WAITING" | "RUNNING" | "FINISHED";

export type SessionState = {
  /** 서버가 준 방 상태 그대로. 취소된 방인지(`CANCELED`) 알아야 결과 화면 문구가 달라진다 */
  status: RoomStatus;
  phase: SessionPhase;
  totalCount: number;
  participants: ParticipantResponse[];
  /** 열려 있는 문항. 마감돼도 지문은 그대로 두고 `reveal`이 채워진다 */
  currentQuestion: QuestionStartedPayload | null;
  /** 이 문항에 내가 답을 냈는가 */
  submitted: boolean;
  /** 마감된 문항의 정답·해설·분포. 다음 문항이 열리면 비운다 */
  reveal: QuestionEndedPayload | null;
  /** 호스트 토픽으로만 오는 제출 집계 */
  submission: SubmissionStatusPayload | null;
  ranking: RankingEntry[];
  finalRanking: RankingEntry[];
  screenLocked: boolean;
  /** @draft 음성 힌트 — 백엔드 미구현이라 목에서만 채워진다 */
  hints: VoiceHintEntry[];
};

export const initialSessionState: SessionState = {
  status: "WAITING",
  phase: "WAITING",
  totalCount: 0,
  participants: [],
  currentQuestion: null,
  submitted: false,
  reveal: null,
  submission: null,
  ranking: [],
  finalRanking: [],
  screenLocked: false,
  hints: [],
};

/** 서버 방 상태 → 화면 단계 */
export function toPhase(status: RoomStatus): SessionPhase {
  if (status === "RUNNING") return "RUNNING";
  if (status === "WAITING") return "WAITING";
  return "FINISHED";
}

/** 페이로드가 배열인 이벤트(RANKING_UPDATED·SESSION_ENDED)를 안전하게 읽는다 */
function asRanking(payload: unknown): RankingEntry[] {
  return Array.isArray(payload) ? (payload as RankingEntry[]) : [];
}

/**
 * 이벤트 하나를 상태에 반영한다.
 *
 * 서버가 실제로 발행하는 것은 7종이다(`PARTICIPANT_*`는 발행 코드가 없다 — 백엔드 질문 B-1).
 * 그 둘도 핸들러는 남겨 둔다: 서버가 발행을 넣는 순간 대기실 폴링을 끄고 바로 쓸 수 있다.
 */
export function reduceSessionEvent(state: SessionState, event: ServerEvent): SessionState {
  switch (event.type) {
    case "SESSION_STARTED":
      return {
        ...state,
        status: "RUNNING",
        phase: "RUNNING",
        currentQuestion: null,
        submitted: false,
        reveal: null,
        submission: null,
        ranking: [],
        finalRanking: [],
      };

    case "QUESTION_STARTED":
      return {
        ...state,
        status: "RUNNING",
        phase: "RUNNING",
        currentQuestion: event.payload,
        totalCount: event.payload.totalCount,
        // 새 문항이 열리면 이전 문항의 제출·정답 공개는 모두 지운다
        submitted: false,
        reveal: null,
        submission: null,
      };

    case "QUESTION_ENDED":
      return { ...state, reveal: event.payload };

    case "RANKING_UPDATED":
      // 서버가 매번 전체 순위를 보내므로 통째로 교체한다(부분 갱신이 아니다)
      return { ...state, ranking: asRanking(event.payload) };

    case "SUBMISSION_UPDATED":
      return { ...state, submission: event.payload };

    case "SCREEN_LOCKED":
      return { ...state, screenLocked: event.payload.locked };

    case "SESSION_ENDED": {
      const finalRanking = asRanking(event.payload);
      return { ...state, status: "ENDED", phase: "FINISHED", finalRanking, ranking: finalRanking };
    }

    case "PARTICIPANT_JOINED": {
      const rest = state.participants.filter((p) => p.id !== event.payload.id);
      return { ...state, participants: [...rest, event.payload] };
    }

    case "PARTICIPANT_LEFT":
      return {
        ...state,
        participants: state.participants.filter((p) => p.id !== event.payload.id),
      };

    default:
      return state;
  }
}

/**
 * 재접속 스냅샷을 통째로 반영한다.
 *
 * 스냅샷은 **WAITING이어도 200**이고 서버 시각(`ts`)이 없다 — 예전 판의 "404 = 미시작" 분기와
 * `ts` 기반 stale 판정은 둘 다 성립하지 않는다(`ws-events.md` §6).
 * 마감된 문항의 정답(`reveal`)은 스냅샷에 없으므로 비운다 — 필요하면 문항 결과 API로 다시 읽는다.
 */
export function applySnapshot(
  state: SessionState,
  snapshot: SessionSnapshotResponse,
): SessionState {
  const phase = toPhase(snapshot.status);

  return {
    ...state,
    status: snapshot.status,
    phase,
    totalCount: snapshot.totalCount,
    currentQuestion: snapshot.currentQuestion ?? null,
    submitted: snapshot.submitted,
    screenLocked: snapshot.screenLocked,
    ranking: snapshot.ranking,
    finalRanking: phase === "FINISHED" ? snapshot.ranking : state.finalRanking,
    reveal: null,
    submission: null,
  };
}

/**
 * 스냅샷을 받기 **전에** 발행된 프레임인가 — 늦게 도착한 옛 프레임이 복구한 상태를 덮지 않게 막는다.
 *
 * 스냅샷에 서버 시각이 없어 기준으로 쓸 수 있는 것은 **스냅샷을 받은 로컬 시각**뿐이다.
 * 클라이언트 시계가 서버와 조금 어긋나도 멀쩡한 프레임을 버리지 않도록 **5초 여유**를 둔다
 * (`research.md` R-7). 읽을 수 없는 시각은 폐기하지 않는다 — 버리는 쪽이 더 위험하다.
 */
const STALE_TOLERANCE_MS = 5_000;

export function isStaleFrame(occurredAt: string, snapshotTs: number): boolean {
  const frame = parseServerDateTime(occurredAt).getTime();
  if (Number.isNaN(frame)) return false;
  return frame < snapshotTs - STALE_TOLERANCE_MS;
}
