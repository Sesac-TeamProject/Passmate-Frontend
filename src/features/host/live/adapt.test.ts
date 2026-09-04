import { describe, expect, it } from "vitest";
import type { QuestionEndedPayload, QuestionStartedPayload } from "@/lib/types/dto";
import type { FinalRankRow } from "./final-page";
import { toPodium, toQuestionResult } from "./adapt";

const OX_QUESTION: QuestionStartedPayload = {
  sessionQuestionId: 32,
  questionId: 23,
  orderNo: 3,
  totalCount: 3,
  type: "OX",
  content: "Spring Bean의 기본 스코프는 prototype이다.",
  points: 100,
  timeLimitSec: 20,
  endsAt: "2099-01-01T00:00:00",
};

const OX_ENDED: QuestionEndedPayload = {
  sessionQuestionId: 32,
  questionId: 23,
  orderNo: 3,
  answer: "X",
  submitCount: 3,
  correctCount: 2,
  correctRate: 66.7,
  distribution: { X: 2, O: 1 },
};

describe("toQuestionResult", () => {
  it("OX는 보기가 없어도 O·X 분포와 정답 키를 만든다", () => {
    const result = toQuestionResult(OX_ENDED, [], OX_QUESTION);
    expect(result.correct).toBe("B");
    expect(result.distribution).toEqual([
      { key: "A", text: "O", count: 1 },
      { key: "B", text: "X", count: 2 },
    ]);
  });

  it("서술형은 정답 키가 없고 분포도 비어 있다", () => {
    const essay = { ...OX_QUESTION, type: "ESSAY" as const };
    const result = toQuestionResult(
      { ...OX_ENDED, answer: undefined, distribution: {} },
      [],
      essay,
    );
    expect(result.correct).toBeNull();
    expect(result.distribution).toEqual([]);
    expect(result.type).toBe("essay");
  });

  it("서술형의 answer는 보기 정답이 아니라 모범답안 본문이다", () => {
    const essay = { ...OX_QUESTION, type: "ESSAY" as const };
    const result = toQuestionResult(
      {
        ...OX_ENDED,
        answer: "싱글턴은 컨테이너당 인스턴스가 하나다.",
        explanation: "핵심어 두 개를 쓰면 만점",
        distribution: {},
      },
      [],
      essay,
    );

    expect(result.modelAnswer).toBe("싱글턴은 컨테이너당 인스턴스가 하나다.");
    expect(result.explanation).toBe("핵심어 두 개를 쓰면 만점");
    // 보기 정답 자리는 여전히 비어 있어야 한다 — 모범답안을 보기 키로 읽으면 안 된다
    expect(result.correct).toBeNull();
  });

  it("객관식·OX의 answer는 모범답안 자리에 들어가지 않는다", () => {
    const result = toQuestionResult(OX_ENDED, [], OX_QUESTION);

    expect(result.type).toBe("ox");
    expect(result.modelAnswer).toBeNull();
  });

  it("문항 정보가 없어도(재접속) 분포가 비면 서술형으로 다룬다", () => {
    const result = toQuestionResult({ ...OX_ENDED, distribution: {} }, [], null);

    expect(result.type).toBe("essay");
  });
});

function row(rank: number): FinalRankRow {
  return {
    rank,
    student: { id: String(rank), name: `학생${rank}`, avatar: "cat" },
    score: 1000 - rank * 10,
    correctCount: null,
  };
}

describe("toPodium", () => {
  it("3명 이상이면 1~3위가 포디움, 나머지가 4위부터", () => {
    const { podium, rest } = toPodium([row(1), row(2), row(3), row(4)]);
    expect(podium.map((p) => p.student.id)).toEqual(["1", "2", "3"]);
    expect(rest.map((r) => r.rank)).toEqual([4]);
  });

  it("2명이면 포디움에 두 자리만 채우고 목록은 비운다 — 1·2위가 '4위부터'로 밀리지 않는다", () => {
    const { podium, rest } = toPodium([row(1), row(2)]);
    expect(podium.map((p) => p.student.id)).toEqual(["1", "2"]);
    expect(rest).toEqual([]);
  });

  it("아무도 없으면 포디움도 목록도 비어 있다", () => {
    const { podium, rest } = toPodium([]);
    expect(podium).toEqual([]);
    expect(rest).toEqual([]);
  });
});
