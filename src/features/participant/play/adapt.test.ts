import { describe, expect, it } from "vitest";
import type { AnswerResponse, QuestionStartedPayload } from "@/lib/types/dto";
import { toLiveQuestion, toRevealView, toScoreView } from "./adapt";

const BASE: QuestionStartedPayload = {
  sessionQuestionId: 30,
  questionId: 23,
  orderNo: 3,
  totalCount: 3,
  type: "MCQ",
  content: "Spring Bean의 기본 스코프는?",
  choices: ["singleton", "prototype"],
  points: 100,
  timeLimitSec: 30,
  endsAt: "2099-01-01T00:00:00",
};

describe("toLiveQuestion", () => {
  it("객관식은 서버 보기를 A·B… 키로 나열한다", () => {
    const q = toLiveQuestion(BASE, 0);
    expect(q.choices).toEqual([
      { key: "A", text: "singleton" },
      { key: "B", text: "prototype" },
    ]);
  });

  it("OX는 서버가 보기를 보내지 않으므로 O·X 두 보기를 만든다", () => {
    // 서버 `Question.choices`는 OX에서 null이다 — 화면은 보기 없이는 답을 낼 수 없다
    const q = toLiveQuestion({ ...BASE, type: "OX", choices: undefined }, 0);
    expect(q.type).toBe("ox");
    expect(q.choices).toEqual([
      { key: "A", text: "O" },
      { key: "B", text: "X" },
    ]);
  });

  it("서술형은 보기가 없다", () => {
    const q = toLiveQuestion({ ...BASE, type: "ESSAY", choices: undefined }, 0);
    expect(q.choices).toEqual([]);
  });
});

describe("toRevealView", () => {
  const mcq = toLiveQuestion(BASE, 0);
  const ended = { answer: "prototype", explanation: "기본 스코프는 singleton이다." };

  it("고른 보기가 정답 원문과 같으면 correct, 다르면 wrong", () => {
    expect(toRevealView(ended, mcq, 1, true)).toMatchObject({
      outcome: "correct",
      correctIndex: 1,
    });
    expect(toRevealView(ended, mcq, 0, true)).toMatchObject({ outcome: "wrong", correctIndex: 1 });
  });

  it("제출하지 않았으면 missed — 정답은 그대로 보여 준다", () => {
    expect(toRevealView(ended, mcq, null, false)).toMatchObject({
      outcome: "missed",
      correctIndex: 1,
      explanation: "기본 스코프는 singleton이다.",
    });
  });

  it("재접속으로 내 선택을 모르면 submitted — 정오를 지어내지 않는다", () => {
    expect(toRevealView(ended, mcq, null, true).outcome).toBe("submitted");
  });

  it("OX는 O·X 원문으로 정답 보기를 찾는다", () => {
    const ox = toLiveQuestion({ ...BASE, type: "OX", choices: undefined }, 0);
    expect(toRevealView({ answer: "X" }, ox, 1, true)).toMatchObject({
      outcome: "correct",
      correctIndex: 1,
    });
  });

  it("서술형은 정오 대신 모범 답안을 싣고 빈 해설은 null로 접는다", () => {
    const essay = toLiveQuestion({ ...BASE, type: "ESSAY", choices: undefined }, 0);
    expect(toRevealView({ answer: "모범답안", explanation: "  " }, essay, null, true)).toEqual({
      outcome: "essay",
      correctIndex: null,
      modelAnswer: "모범답안",
      explanation: null,
    });
  });
});

describe("toScoreView", () => {
  // 서버 AnswerResponse 전 필드 — 문항 30에 낸 정답, 기본 100 + 속도 보너스 47
  const CORRECT: AnswerResponse = {
    answerId: 7,
    sessionQuestionId: 30,
    isCorrect: true,
    baseScore: 100,
    speedBonus: 47,
    score: 147,
    submittedAt: "2099-01-01T00:00:00",
  };

  it("정답이면 서버가 준 총점과 기본·속도 보너스 내역을 그대로 싣는다", () => {
    expect(toScoreView(CORRECT, 30)).toEqual({
      verdict: "correct",
      score: 147,
      baseScore: 100,
      speedBonus: 47,
    });
  });

  it("오답이면 wrong — 0점도 서버가 확정한 사실이라 숫자를 싣는다", () => {
    const wrong: AnswerResponse = {
      answerId: 8,
      sessionQuestionId: 30,
      isCorrect: false,
      baseScore: 0,
      speedBonus: 0,
      score: 0,
      submittedAt: "2099-01-01T00:00:00",
    };
    expect(toScoreView(wrong, 30)).toEqual({
      verdict: "wrong",
      score: 0,
      baseScore: 0,
      speedBonus: 0,
    });
  });

  it("서술형은 isCorrect가 빠져 온다 — 오답이 아니라 grading이고 채점 전 점수는 싣지 않는다", () => {
    const essay: AnswerResponse = {
      answerId: 9,
      sessionQuestionId: 30,
      baseScore: 0,
      speedBonus: 0,
      score: 0,
      submittedAt: "2099-01-01T00:00:00",
    };
    expect(toScoreView(essay, 30)).toEqual({ verdict: "grading" });
  });

  it("다른 문항에 낸 응답이면 null — 이전 문항 점수가 새 문항에 남지 않는다", () => {
    expect(toScoreView(CORRECT, 31)).toBeNull();
  });

  it("제출 응답이 없으면(아직 안 냈거나 새로고침 뒤) null", () => {
    expect(toScoreView(undefined, 30)).toBeNull();
  });
});
