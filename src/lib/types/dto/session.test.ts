import { describe, expect, it } from "vitest";
import {
  __resetSessionForTests,
  mockNext,
  mockSnapshot,
  mockStartSession,
  mockSubmissions,
  mockSubmitAnswer,
} from "@/lib/mocks/session";
import { expectContract } from "./expect-contract";

/**
 * 백엔드 `session/dto/*.kt` (develop @ 5f433d2)와 1:1인지 목이 돌려주는 값으로 고정한다.
 *
 * 여기가 어긋나면 세션 화면이 조용히 멈춘다 — 스냅샷은 WAITING에도 200이고, 답안 제출 본문은
 * `content`가 아니라 `submitted`이며, 문항 경로에 들어가는 것은 `questionId`(세트 문항 id)다.
 */
const QUESTION_STARTED_REQUIRED = [
  "sessionQuestionId",
  "questionId",
  "orderNo",
  "totalCount",
  "type",
  "content",
  "points",
  "timeLimitSec",
  "endsAt",
];

describe("session 계약", () => {
  it("스냅샷은 WAITING이어도 200이고 ts가 없다", () => {
    __resetSessionForTests();
    const snapshot = mockSnapshot();

    expectContract(
      snapshot,
      [
        "roomId",
        "status",
        "currentQuestionNo",
        "totalCount",
        "screenLocked",
        "submitted",
        "ranking",
      ],
      ["currentQuestion"],
    );
    expect(snapshot.status).toBe("WAITING");
    // 서버 시각이 없다 — stale 판정은 스냅샷을 받은 로컬 시각으로만 할 수 있다
    expect(snapshot).not.toHaveProperty("ts");
  });

  it("진행 중 스냅샷의 currentQuestion은 QUESTION_STARTED와 같은 모양이고 정답이 없다", () => {
    __resetSessionForTests();
    mockStartSession();
    const question = mockSnapshot().currentQuestion;

    expect(question).toBeDefined();
    expectContract(question as object, QUESTION_STARTED_REQUIRED, ["choices"]);
    // 진행 중에는 정답을 절대 내려보내지 않는다
    expect(question).not.toHaveProperty("answer");
    expect(question).not.toHaveProperty("explanation");
  });

  it("답안 제출 응답은 총점·순위 없이 이번 문항 점수만 준다", () => {
    __resetSessionForTests();
    mockStartSession();
    const answer = mockSubmitAnswer({ submitted: "REQUIRED" });

    expectContract(
      answer,
      ["answerId", "sessionQuestionId", "baseScore", "speedBonus", "score", "submittedAt"],
      ["isCorrect"],
    );
    expect(answer).not.toHaveProperty("totalScore");
    expect(answer).not.toHaveProperty("rank");
  });

  it("제출 현황은 집계만 준다 — 참가자별 제출 여부는 없다", () => {
    __resetSessionForTests();
    mockStartSession();

    expectContract(mockSubmissions(), [
      "sessionQuestionId",
      "submitCount",
      "participantCount",
      "correctCount",
      "correctRate",
      "distribution",
    ]);
  });

  it("세션 제어는 본문 없이 끝난다 (204)", () => {
    __resetSessionForTests();
    expect(mockStartSession()).toBeUndefined();
    expect(mockNext()).toBeUndefined();
  });
});
