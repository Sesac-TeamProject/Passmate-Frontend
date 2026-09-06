import { describe, expect, it } from "vitest";
import type {
  QuestionEndedPayload,
  QuestionStartedPayload,
  SubmissionStatusPayload,
} from "@/lib/types/dto";
import type { FinalRankRow } from "./final-page";
import { pickSubmissionForQuestion, toPodium, toQuestionResult } from "./adapt";

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

  it("문항 정보가 없어도(재접속) 분포가 차 있으면 객관식으로 다룬다", () => {
    // 서버가 준 분포를 봐야 한다. 보기에서 만든 배열을 보면 문항이 없을 때 늘 비어 있어
    // 객관식이 통째로 서술형으로 분류된다(QA_BACKLOG F-17)
    const result = toQuestionResult(OX_ENDED, [], null);

    expect(result.type).toBe("multiple");
    // 서술형이 아니므로 answer를 모범답안 자리에 넣으면 안 된다
    expect(result.modelAnswer).toBeNull();
  });

  it("정답률은 정수로 접는다 — 서버는 16.666…처럼 소수로 준다", () => {
    const result = toQuestionResult(
      { ...OX_ENDED, correctRate: 16.666666666666668 },
      [],
      OX_QUESTION,
    );

    expect(result.accuracy).toBe(17);
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

describe("pickSubmissionForQuestion", () => {
  const status = (sessionQuestionId: number, submitCount: number): SubmissionStatusPayload => ({
    sessionQuestionId,
    submitCount,
    participantCount: 24,
    correctCount: 0,
    correctRate: 0,
    distribution: {},
  });

  it("지금 문항의 집계를 그대로 쓴다", () => {
    expect(pickSubmissionForQuestion(56, status(56, 18))?.submitCount).toBe(18);
  });

  it("이전 문항의 집계는 버린다 — 새 문항에 옛 제출 수가 남으면 안 된다", () => {
    expect(pickSubmissionForQuestion(57, status(56, 18))).toBeNull();
  });

  it("폴링이 낡았으면 이벤트 값을 쓴다", () => {
    // 스토어(이벤트)가 먼저, 최대 3초 낡는 폴링 응답이 뒤
    expect(pickSubmissionForQuestion(57, status(57, 3), status(56, 18))?.submitCount).toBe(3);
  });

  it("이벤트가 낡았으면 폴링 값을 쓴다 — 늦게 온 이벤트에 가리지 않는다", () => {
    expect(pickSubmissionForQuestion(57, status(56, 18), status(57, 3))?.submitCount).toBe(3);
  });

  it("둘 다 없거나 둘 다 낡았으면 null", () => {
    expect(pickSubmissionForQuestion(57, null, undefined)).toBeNull();
    expect(pickSubmissionForQuestion(57, status(56, 18), status(55, 24))).toBeNull();
  });
});
