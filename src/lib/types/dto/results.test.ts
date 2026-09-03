import { describe, expect, it } from "vitest";
import {
  __resetResultsForTests,
  mockMyAnswer,
  mockMyReport,
  mockMyResult,
  mockParticipantResult,
  mockRequestAnalysis,
  mockReviewTargets,
  mockSessionResults,
} from "@/lib/mocks/results";
import { expectContract } from "./expect-contract";

/**
 * 백엔드 `report/dto/*.kt`·`feedback/dto/*.kt` (develop @ 5f433d2)와 1:1인지 고정한다.
 *
 * 결과 화면이 조용히 틀리기 쉬운 곳이라 특히 붙잡아 둔다: 서술형에는 `isCorrect`가 없고,
 * 안 낸 문항은 `submitted` 필드 자체가 빠지며, 분석 내용은 `DONE`일 때만 온다.
 */
const ANSWER_VIEW_REQUIRED = [
  "sessionQuestionId",
  "questionId",
  "orderNo",
  "type",
  "content",
  "points",
  "score",
  "finalScore",
  "analysisStatus",
];
const ANSWER_VIEW_OPTIONAL = [
  "answer",
  "explanation",
  "submitted",
  "isCorrect",
  "analysis",
  "teacherReview",
];

describe("결과 계약", () => {
  it("GET /results/me는 rating(평가 가능 여부)까지 함께 준다", () => {
    __resetResultsForTests();
    const result = mockMyResult();

    expectContract(
      result,
      [
        "roomId",
        "roomTitle",
        "status",
        "participantId",
        "nickname",
        "avatarId",
        "guest",
        "rank",
        "totalScore",
        "correctCount",
        "submitCount",
        "questionCount",
        "questions",
        "rating",
      ],
      ["endedAt"],
    );
    expectContract(result.rating, ["available", "alreadyRated"], ["blockedReason", "deadline"]);
    // 호스트 이름은 응답에 없다(DESIGN_GAPS G-8) — 화면이 지어내면 안 된다
    expect(result).not.toHaveProperty("hostNickname");
  });

  it("문항 줄에서 서술형은 isCorrect가 없다 — 자동 채점하지 않는다", () => {
    __resetResultsForTests();
    const questions = mockMyResult().questions;

    for (const q of questions) expectContract(q, ANSWER_VIEW_REQUIRED, ANSWER_VIEW_OPTIONAL);
    for (const essay of questions.filter((q) => q.type === "ESSAY")) {
      expect(essay).not.toHaveProperty("isCorrect");
    }
  });

  it("GET /results (호스트)는 요약·문항별·학생별 세 덩이다 — pin·최고점은 없다", () => {
    const results = mockSessionResults();

    expectContract(
      results,
      ["roomId", "title", "status", "summary", "questions", "participants"],
      ["startedAt", "endedAt"],
    );
    expectContract(results.summary, [
      "participantCount",
      "questionCount",
      "avgCorrectRate",
      "avgScore",
      "aiAnalysisCount",
    ]);
    expect(results).not.toHaveProperty("pin");
    expect(results.summary).not.toHaveProperty("topScore");
  });

  it("학생별 상세는 문항 줄을 그대로 담는다", () => {
    const detail = mockParticipantResult("11");

    expectContract(detail, [
      "roomId",
      "participantId",
      "nickname",
      "avatarId",
      "rank",
      "totalScore",
      "correctCount",
      "submitCount",
      "questionCount",
      "questions",
    ]);
  });

  it("학습 리포트는 서버가 만든 개선 문장까지 준다", () => {
    expectContract(mockMyReport(), [
      "roomId",
      "roomTitle",
      "participantId",
      "nickname",
      "totalQuestions",
      "correctCount",
      "accuracy",
      "totalScore",
      "finalRank",
      "weakTopics",
      "improvementPoints",
      "generatedAt",
    ]);
  });
});

describe("서술형 AI 분석 계약", () => {
  it("내 답안 응답에 남은 무료 횟수와 코인 단가가 들어 있다", () => {
    __resetResultsForTests();
    const answer = mockMyAnswer("1");

    expectContract(
      answer,
      [
        "roomId",
        "sessionQuestionId",
        "questionId",
        "orderNo",
        "type",
        "content",
        "points",
        "submitted",
        "score",
        "finalScore",
        "submittedAt",
        "analysisStatus",
        "analysisCoinCost",
      ],
      ["isCorrect", "answer", "explanation", "analysis", "teacherReview", "remainingFreeAnalysis"],
    );
  });

  it("요청하면 PENDING이 되고 분석 내용은 아직 없다", () => {
    __resetResultsForTests();
    const accepted = mockRequestAnalysis();

    expectContract(accepted, [
      "analysisStatus",
      "chargedCoins",
      "remainingFreeAnalysis",
      "analysisCoinCost",
    ]);
    expect(accepted.analysisStatus).toBe("PENDING");
    expect(mockMyAnswer("1").analysis).toBeUndefined();
  });

  it("무료 횟수를 다 쓰면 402로 막힌다", () => {
    __resetResultsForTests();
    for (let i = 0; i < 5; i += 1) mockRequestAnalysis();

    expect(() => mockRequestAnalysis()).toThrowError(
      expect.objectContaining({ kind: "PaymentRequired", code: "INSUFFICIENT_COINS" }),
    );
  });
});

describe("첨삭 대상 계약", () => {
  it("진행률(전체·완료)과 답안 줄을 함께 준다", () => {
    const list = mockReviewTargets(new URL("http://x/rooms/1/answers"));

    expectContract(list, ["roomId", "totalCount", "reviewedCount", "answers"]);
    expectContract(
      list.answers[0],
      [
        "answerId",
        "sessionQuestionId",
        "questionId",
        "orderNo",
        "type",
        "questionContent",
        "points",
        "participantId",
        "nickname",
        "avatarId",
        "submitted",
        "score",
        "finalScore",
        "submittedAt",
        "analysisStatus",
        "reviewed",
      ],
      ["modelAnswer", "isCorrect", "analysis", "teacherReview"],
    );
  });
});
