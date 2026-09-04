import { describe, expect, it } from "vitest";
import type {
  QuestionEndedPayload,
  QuestionStartedPayload,
  RankingEntry,
  SessionSnapshotResponse,
} from "@/lib/types/dto";
import type { ServerEvent } from "@/lib/types/events";
import {
  applySnapshot,
  initialSessionState,
  isStaleFrame,
  reduceSessionEvent,
  type SessionState,
} from "./session-reducer";

const QUESTION: QuestionStartedPayload = {
  sessionQuestionId: 100,
  questionId: 2,
  orderNo: 1,
  totalCount: 8,
  type: "MCQ",
  content: "@Transactional의 기본 전파 속성은?",
  choices: ["REQUIRED", "REQUIRES_NEW"],
  points: 100,
  timeLimitSec: 30,
  endsAt: "2026-09-02T02:13:19",
};

const ENDED: QuestionEndedPayload = {
  sessionQuestionId: 100,
  questionId: 2,
  orderNo: 1,
  answer: "REQUIRED",
  explanation: "진행 중인 트랜잭션이 있으면 참여한다",
  submitCount: 6,
  correctCount: 4,
  correctRate: 66.7,
  distribution: { REQUIRED: 4, REQUIRES_NEW: 2 },
};

const RANKING: RankingEntry[] = [
  { rank: 1, participantId: 11, nickname: "준영", avatarId: "cat", totalScore: 300 },
  { rank: 2, participantId: 12, nickname: "혜림", avatarId: "rabbit", totalScore: 200 },
];

function event<T extends ServerEvent["type"]>(type: T, payload?: unknown): ServerEvent {
  return { type, roomId: 1, occurredAt: "2026-09-02T02:12:49", payload } as ServerEvent;
}

function reduce(state: SessionState, ...events: ServerEvent[]): SessionState {
  return events.reduce(reduceSessionEvent, state);
}

describe("세션 리듀서 — 서버 이벤트 7종", () => {
  it("SESSION_STARTED는 진행 중으로 바꾸고 지난 회차 흔적을 지운다", () => {
    const dirty = { ...initialSessionState, ranking: RANKING, reveal: ENDED };
    const next = reduce(dirty, event("SESSION_STARTED"));

    expect(next.phase).toBe("RUNNING");
    expect(next.status).toBe("RUNNING");
    expect(next.ranking).toEqual([]);
    expect(next.reveal).toBeNull();
  });

  it("QUESTION_STARTED는 문항을 열고 제출·정답 공개를 초기화한다", () => {
    const answered = { ...initialSessionState, submitted: true, reveal: ENDED };
    const next = reduce(answered, event("QUESTION_STARTED", QUESTION));

    expect(next.currentQuestion).toEqual(QUESTION);
    expect(next.totalCount).toBe(8);
    expect(next.submitted).toBe(false);
    expect(next.reveal).toBeNull();
  });

  it("QUESTION_ENDED는 정답을 공개하되 지문은 그대로 둔다", () => {
    const next = reduce(
      initialSessionState,
      event("QUESTION_STARTED", QUESTION),
      event("QUESTION_ENDED", ENDED),
    );

    expect(next.reveal).toEqual(ENDED);
    // 정답 공개 뒤에도 문항 지문·보기는 화면에 남아 있어야 한다
    expect(next.currentQuestion).toEqual(QUESTION);
  });

  it("이미 지나간 문항의 QUESTION_ENDED는 버린다 — 서버가 마감 이벤트를 되풀이해도 다음 문항 화면이 결과로 되돌아가지 않는다", () => {
    const q2 = { ...QUESTION, sessionQuestionId: 101, orderNo: 2 };
    const next = reduce(
      initialSessionState,
      event("QUESTION_STARTED", QUESTION),
      event("QUESTION_ENDED", ENDED),
      event("QUESTION_STARTED", q2),
      // 1번 문항 마감이 늦게(또는 다시) 도착
      event("QUESTION_ENDED", ENDED),
    );

    expect(next.currentQuestion).toEqual(q2);
    expect(next.reveal).toBeNull();
  });

  it("같은 문항의 QUESTION_ENDED가 반복돼도 상태는 그대로다", () => {
    const once = reduce(
      initialSessionState,
      event("QUESTION_STARTED", QUESTION),
      event("QUESTION_ENDED", ENDED),
    );
    const twice = reduceSessionEvent(once, event("QUESTION_ENDED", ENDED));

    expect(twice).toBe(once);
  });

  it("RANKING_UPDATED는 순위를 통째로 교체한다", () => {
    const stale = { ...initialSessionState, ranking: RANKING };
    const next = reduce(stale, event("RANKING_UPDATED", [RANKING[0]]));

    expect(next.ranking).toEqual([RANKING[0]]);
  });

  it("SUBMISSION_UPDATED는 호스트 집계를 담는다", () => {
    const payload = {
      sessionQuestionId: 100,
      submitCount: 3,
      participantCount: 6,
      correctCount: 2,
      correctRate: 66.7,
      distribution: { REQUIRED: 2, REQUIRES_NEW: 1 },
    };
    expect(reduce(initialSessionState, event("SUBMISSION_UPDATED", payload)).submission).toEqual(
      payload,
    );
  });

  it("SCREEN_LOCKED는 잠금 상태만 바꾼다", () => {
    expect(reduce(initialSessionState, event("SCREEN_LOCKED", { locked: true })).screenLocked).toBe(
      true,
    );
  });

  it("SESSION_ENDED는 최종 랭킹과 함께 끝낸다", () => {
    const next = reduce(initialSessionState, event("SESSION_ENDED", RANKING));

    expect(next.phase).toBe("FINISHED");
    expect(next.status).toBe("ENDED");
    expect(next.finalRanking).toEqual(RANKING);
    expect(next.ranking).toEqual(RANKING);
  });

  it("페이로드가 배열이 아니어도 랭킹 자리를 깨뜨리지 않는다", () => {
    expect(reduce(initialSessionState, event("RANKING_UPDATED", undefined)).ranking).toEqual([]);
  });
});

/**
 * 서버가 아직 발행하지 않는 두 이벤트(백엔드 질문 B-1). 발행이 들어오는 순간
 * 대기실 폴링을 끄고 그대로 쓸 수 있어야 해서 핸들러를 남겨 둔다.
 */
describe("세션 리듀서 — 참가자 이벤트(서버 미발행)", () => {
  const participant = {
    id: 11,
    nickname: "준영",
    avatarId: "cat",
    isGuest: true,
    joinedAt: "2026-09-02T02:00:11",
  };

  it("JOINED는 같은 참가자를 중복으로 쌓지 않는다", () => {
    const next = reduce(
      initialSessionState,
      event("PARTICIPANT_JOINED", participant),
      event("PARTICIPANT_JOINED", { ...participant, nickname: "준영2" }),
    );

    expect(next.participants).toHaveLength(1);
    expect(next.participants[0].nickname).toBe("준영2");
  });

  it("LEFT는 그 참가자만 뺀다", () => {
    const next = reduce(
      initialSessionState,
      event("PARTICIPANT_JOINED", participant),
      event("PARTICIPANT_JOINED", { ...participant, id: 12, nickname: "혜림" }),
      event("PARTICIPANT_LEFT", participant),
    );

    expect(next.participants.map((p) => p.id)).toEqual([12]);
  });
});

describe("applySnapshot", () => {
  const snapshot: SessionSnapshotResponse = {
    roomId: 1,
    status: "RUNNING",
    currentQuestionNo: 1,
    totalCount: 8,
    screenLocked: false,
    currentQuestion: QUESTION,
    submitted: true,
    ranking: RANKING,
  };

  it("진행 중 스냅샷으로 현재 문항·제출 여부·순위를 복구한다", () => {
    const next = applySnapshot(initialSessionState, snapshot);

    expect(next.phase).toBe("RUNNING");
    expect(next.currentQuestion).toEqual(QUESTION);
    expect(next.submitted).toBe(true);
    expect(next.ranking).toEqual(RANKING);
  });

  it("WAITING 스냅샷도 정상 응답이다 — 404가 아니다", () => {
    const next = applySnapshot(initialSessionState, {
      ...snapshot,
      status: "WAITING",
      currentQuestionNo: 0,
      currentQuestion: undefined,
      submitted: false,
      ranking: [],
    });

    expect(next.phase).toBe("WAITING");
    expect(next.currentQuestion).toBeNull();
  });

  it("ENDED·CANCELED는 둘 다 FINISHED지만 status로 구분된다", () => {
    expect(applySnapshot(initialSessionState, { ...snapshot, status: "ENDED" }).phase).toBe(
      "FINISHED",
    );

    const canceled = applySnapshot(initialSessionState, { ...snapshot, status: "CANCELED" });
    expect(canceled.phase).toBe("FINISHED");
    expect(canceled.status).toBe("CANCELED");
  });

  it("마감된 문항의 정답은 스냅샷에 없으므로 비운다", () => {
    const revealed = { ...initialSessionState, reveal: ENDED };
    expect(applySnapshot(revealed, snapshot).reveal).toBeNull();
  });
});

/**
 * 스냅샷에 서버 시각이 없어 기준은 **스냅샷을 받은 로컬 시각**뿐이다.
 * 클라이언트 시계가 조금 어긋나도 멀쩡한 프레임을 버리지 않도록 5초 여유를 둔다.
 */
describe("isStaleFrame", () => {
  const snapshotTs = Date.UTC(2026, 8, 2, 2, 12, 49);

  it("여유(5초)보다 더 오래된 프레임은 버린다", () => {
    expect(isStaleFrame("2026-09-02T02:12:40", snapshotTs)).toBe(true);
  });

  it("여유 안쪽이면 버리지 않는다 — 시계 오차로 멀쩡한 프레임을 잃지 않게", () => {
    expect(isStaleFrame("2026-09-02T02:12:46", snapshotTs)).toBe(false);
    expect(isStaleFrame("2026-09-02T02:12:52", snapshotTs)).toBe(false);
  });

  it("읽을 수 없는 시각은 버리지 않는다", () => {
    expect(isStaleFrame("어제", snapshotTs)).toBe(false);
  });
});
