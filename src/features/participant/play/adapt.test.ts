import { describe, expect, it } from "vitest";
import type { QuestionStartedPayload } from "@/lib/types/dto";
import { toLiveQuestion, toRevealView } from "./adapt";

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
    expect(toRevealView(ended, mcq, 1, true)).toMatchObject({ outcome: "correct", correctIndex: 1 });
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
    expect(toRevealView({ answer: "X" }, ox, 1, true)).toMatchObject({ outcome: "correct", correctIndex: 1 });
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
