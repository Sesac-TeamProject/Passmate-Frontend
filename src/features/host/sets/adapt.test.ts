import { describe, expect, it } from "vitest";
import type {
  QuestionResponse,
  QuestionSetDetailResponse,
  QuestionSetSummaryResponse,
} from "@/lib/types/dto";
import { toQuestionSets, toSetDetail } from "./adapt";

function question(
  over: Partial<QuestionResponse> & { id: number; orderNo: number },
): QuestionResponse {
  return {
    type: "MCQ",
    content: `문항 ${over.orderNo}`,
    timeLimitSec: 20,
    points: 100,
    source: "AI",
    ...over,
  };
}

function detail(questions: QuestionResponse[]): QuestionSetDetailResponse {
  return {
    set: {
      id: 19,
      title: "Spring 기초",
      status: "CONFIRMED",
      questionCount: questions.length,
      totalPoints: questions.length * 100,
      usageCount: 0,
      createdAt: "2026-09-01T02:00:00",
    },
    questions,
  };
}

describe("toSetDetail", () => {
  it("유형별 개수를 시안 순서(객관식 → 서술형 → OX)로 센다", () => {
    const { composition } = toSetDetail(
      detail([
        question({ id: 1, orderNo: 1, type: "ESSAY" }),
        question({ id: 2, orderNo: 2, type: "OX" }),
        question({ id: 3, orderNo: 3, type: "MCQ" }),
        question({ id: 4, orderNo: 4, type: "MCQ" }),
      ]),
    );

    expect(composition).toEqual([
      { type: "multiple", count: 2 },
      { type: "essay", count: 1 },
      { type: "ox", count: 1 },
    ]);
  });

  it("없는 유형의 칩은 만들지 않는다", () => {
    const { composition } = toSetDetail(detail([question({ id: 1, orderNo: 1 })]));

    expect(composition).toEqual([{ type: "multiple", count: 1 }]);
  });

  it("미리보기는 문항 순서대로 앞 3개다 — 응답 순서가 뒤섞여도 orderNo를 따른다", () => {
    const { preview } = toSetDetail(
      detail([
        question({ id: 3, orderNo: 3, content: "세 번째" }),
        question({ id: 1, orderNo: 1, content: "첫 번째" }),
        question({ id: 4, orderNo: 4, content: "네 번째" }),
        question({ id: 2, orderNo: 2, content: "두 번째" }),
      ]),
    );

    expect(preview).toEqual(["첫 번째", "두 번째", "세 번째"]);
  });

  it("문항이 없으면 칩도 미리보기도 비운다", () => {
    expect(toSetDetail(detail([]))).toEqual({ composition: [], preview: [] });
  });
});

function summaryItem(over: Partial<QuestionSetSummaryResponse> = {}): QuestionSetSummaryResponse {
  return {
    id: 19,
    title: "Spring 기초",
    status: "CONFIRMED",
    questionCount: 4,
    totalPoints: 400,
    usageCount: 0,
    ...over,
  };
}

describe("toQuestionSets", () => {
  it("목록 응답에는 유형별 개수가 없어 요약을 비운다 — 빈 문자열을 카드에 흘리지 않는다", () => {
    expect(toQuestionSets([summaryItem()])[0].summary).toBeUndefined();
  });

  it("예상 시간이 비어 오면 그 자리도 비운다 — 0분을 지어내지 않는다", () => {
    expect(toQuestionSets([summaryItem({ estimatedSeconds: undefined })])[0].minutes).toBeNull();
  });

  it("예상 시간이 오면 분으로 올림한다", () => {
    expect(toQuestionSets([summaryItem({ estimatedSeconds: 90 })])[0].minutes).toBe(2);
  });
});
