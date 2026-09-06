import { describe, expect, it } from "vitest";
import type { QuestionStartedPayload } from "@/lib/types/dto";
import { toLiveQuestion } from "./adapt";

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
