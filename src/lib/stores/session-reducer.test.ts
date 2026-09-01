import { describe, expect, it } from "vitest";
import {
  applySnapshot,
  initialSessionState,
  isStaleFrame,
  reduceSessionEvent,
} from "./session-reducer";

const ts = "2026-08-31T10:00:00Z";

describe("session-reducer", () => {
  it("PARTICIPANT_JOINED / LEFT 는 참가자를 추가·제거한다", () => {
    let s = reduceSessionEvent(initialSessionState, {
      type: "PARTICIPANT_JOINED",
      ts,
      data: { participantId: 11, nickname: "영희", isGuest: true, avatarId: "cat", count: 1 },
    });
    expect(s.participants).toHaveLength(1);
    s = reduceSessionEvent(s, {
      type: "PARTICIPANT_LEFT",
      ts,
      data: { participantId: 11, count: 0 },
    });
    expect(s.participants).toHaveLength(0);
  });
  it("SESSION_STARTED 는 phase RUNNING 으로 초기화한다", () => {
    const s = reduceSessionEvent(initialSessionState, {
      type: "SESSION_STARTED",
      ts,
      data: { sessionId: 7, questionCount: 8 },
    });
    expect(s.phase).toBe("RUNNING");
    expect(s.questionCount).toBe(8);
    expect(s.currentQuestion).toBeNull();
  });
  it("QUESTION_STARTED 는 현재 문항·endsAt 을 바꾸고 제출 현황·정답 공개를 리셋한다", () => {
    const started = reduceSessionEvent(initialSessionState, {
      type: "QUESTION_STARTED",
      ts,
      data: {
        questionId: 3,
        questionNo: 2,
        type: "OX",
        body: "b",
        points: 100,
        timeLimitSec: 20,
        endsAt: "2026-08-31T10:00:20Z",
      },
    });
    expect(started.currentQuestion?.questionNo).toBe(2);
    expect(started.submitted).toEqual({
      submittedCount: 0,
      totalCount: started.participants.length,
    });
    expect(started.reveal).toBeNull();
  });
  it("ANSWER_SUBMITTED / SUBMISSION_UPDATED 는 제출 수를 갱신한다", () => {
    const s = reduceSessionEvent(initialSessionState, {
      type: "SUBMISSION_UPDATED",
      ts,
      data: { questionNo: 1, submittedCount: 5, totalCount: 9 },
    });
    expect(s.submitted).toEqual({ submittedCount: 5, totalCount: 9 });
  });
  it("QUESTION_ENDED 는 정답 공개를 저장하고 문항을 닫는다", () => {
    const q = reduceSessionEvent(initialSessionState, {
      type: "QUESTION_STARTED",
      ts,
      data: {
        questionId: 3,
        questionNo: 2,
        type: "OX",
        body: "b",
        points: 100,
        timeLimitSec: 20,
        endsAt: ts,
      },
    });
    const s = reduceSessionEvent(q, {
      type: "QUESTION_ENDED",
      ts,
      data: { questionNo: 2, answerReveal: { answer: "O", explanation: "e" }, correctCount: 4 },
    });
    expect(s.reveal).toEqual({ questionNo: 2, answer: "O", explanation: "e", correctCount: 4 });
    expect(s.currentQuestion?.isClosed).toBe(true);
  });
  it("RANKING_UPDATED 는 병합이 아니라 전체 교체다", () => {
    const a = reduceSessionEvent(initialSessionState, {
      type: "RANKING_UPDATED",
      ts,
      data: {
        ranking: [
          { rank: 1, participantId: 1, nickname: "a", total: 10 },
          { rank: 2, participantId: 2, nickname: "b", total: 5 },
        ],
      },
    });
    const b = reduceSessionEvent(a, {
      type: "RANKING_UPDATED",
      ts,
      data: { ranking: [{ rank: 1, participantId: 2, nickname: "b", total: 20 }] },
    });
    expect(b.ranking).toEqual([{ rank: 1, participantId: 2, nickname: "b", total: 20 }]);
  });
  it("SESSION_ENDED 는 phase FINISHED + finalRanking", () => {
    const s = reduceSessionEvent(initialSessionState, {
      type: "SESSION_ENDED",
      ts,
      data: {
        sessionId: 7,
        finalRanking: [{ rank: 1, participantId: 2, nickname: "b", total: 20 }],
      },
    });
    expect(s.phase).toBe("FINISHED");
    expect(s.finalRanking).toHaveLength(1);
  });
  it("HINT_PUBLISHED 는 힌트 이력에 추가, SCREEN_LOCKED 는 isLocked", () => {
    let s = reduceSessionEvent(initialSessionState, {
      type: "HINT_PUBLISHED",
      ts,
      data: { hintId: 1, questionNo: 1, clipUrl: "u", durationMs: 3000 },
    });
    expect(s.hints).toHaveLength(1);
    s = reduceSessionEvent(s, { type: "SCREEN_LOCKED", ts, data: { locked: true } });
    expect(s.isLocked).toBe(true);
  });
  it("applySnapshot 은 상태를 통째 교체한다 (404 미시작은 호출자가 WAITING 으로)", () => {
    const s = applySnapshot(initialSessionState, {
      status: "RUNNING",
      ts,
      questionCount: 8,
      currentQuestion: { questionId: 3, questionNo: 2, body: "b", endsAt: ts },
      ranking: [],
      isLocked: true,
    });
    expect(s.phase).toBe("RUNNING");
    expect(s.currentQuestion?.questionNo).toBe(2);
    expect(s.isLocked).toBe(true);
  });
  it("isStaleFrame 은 스냅샷 ts 이전 프레임만 true", () => {
    expect(isStaleFrame("2026-08-31T09:59:59Z", ts)).toBe(true);
    expect(isStaleFrame(ts, ts)).toBe(false);
    expect(isStaleFrame("bad", ts)).toBe(false);
  });
});
