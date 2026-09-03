import { describe, expect, it } from "vitest";
import {
  mockAddQuestion,
  mockCreateQuestionSet,
  mockQuestionSetDetail,
  mockQuestionSets,
} from "@/lib/mocks/question-sets";
import { expectContract } from "./expect-contract";

/**
 * 백엔드 `question/dto/{QuestionResponses,QuestionRequests,AiGenerateRequests}.kt`
 * (develop @ 5f433d2)와 1:1인지 목이 돌려주는 값으로 고정한다.
 *
 * 여기가 깨지면 에디터가 조용히 빈 화면이 된다 — 세트 상세는 `{set, questions}` 두 겹이고,
 * 문항 유형은 `MCQ`(프런트 옛 이름 `MULTIPLE_CHOICE` 아님)다.
 */
const SET_SUMMARY_REQUIRED = [
  "id",
  "title",
  "status",
  "questionCount",
  "totalPoints",
  "usageCount",
];
const SET_SUMMARY_OPTIONAL = [
  "description",
  "source",
  "estimatedSeconds",
  "lastUsedAt",
  "confirmedAt",
  "createdAt",
];
const QUESTION_REQUIRED = ["id", "orderNo", "type", "content", "timeLimitSec", "points", "source"];
const QUESTION_OPTIONAL = ["choices", "answer", "explanation", "topic", "difficulty"];

describe("question-sets 계약", () => {
  it("GET /question-sets는 PageResponse<QuestionSetSummaryResponse>다", () => {
    const page = mockQuestionSets(new URL("http://x/question-sets"));

    expectContract(page, ["content", "page", "size", "totalElements", "totalPages", "hasNext"]);
    expect(Array.isArray(page.content)).toBe(true);
    expectContract(page.content[0], SET_SUMMARY_REQUIRED, SET_SUMMARY_OPTIONAL);
  });

  it("GET /question-sets/{id}는 {set, questions} 두 겹이다", () => {
    const detail = mockQuestionSetDetail("1");

    expectContract(detail, ["set", "questions"]);
    expectContract(detail.set, SET_SUMMARY_REQUIRED, SET_SUMMARY_OPTIONAL);
    expectContract(detail.questions[0], QUESTION_REQUIRED, QUESTION_OPTIONAL);
  });

  it("문항 유형은 MCQ·OX·ESSAY 셋뿐이다", () => {
    const types = new Set(mockQuestionSetDetail("1").questions.map((q) => q.type));
    for (const type of types) expect(["MCQ", "OX", "ESSAY"]).toContain(type);
  });

  it("MCQ 정답은 보기 원문 중 하나다 (인덱스가 아니다)", () => {
    const mcq = mockQuestionSetDetail("1").questions.filter((q) => q.type === "MCQ");
    expect(mcq.length).toBeGreaterThan(0);
    for (const q of mcq) {
      expect(q.choices?.length ?? 0).toBeGreaterThanOrEqual(2);
      if (q.answer) expect(q.choices).toContain(q.answer);
    }
  });

  it("POST /question-sets/{id}/questions는 QuestionResponse 한 건을 돌려준다", () => {
    // 확정 세트는 문항을 못 붙인다(409) — 초안 세트를 새로 만들어 확인한다
    const draft = mockCreateQuestionSet({ title: "계약 테스트 세트" });
    const created = mockAddQuestion(String(draft.id), {
      type: "OX",
      content: "계약 테스트용 문항",
      answer: "O",
    });

    expectContract(created, QUESTION_REQUIRED, QUESTION_OPTIONAL);
    expect(created.source).toBe("MANUAL");
    expect(created.orderNo).toBe(1);
  });

  it("확정된 세트는 문항을 고칠 수 없다 (서버와 같은 409)", () => {
    expect(() =>
      mockAddQuestion("1", { type: "OX", content: "막혀야 한다", answer: "O" }),
    ).toThrowError(expect.objectContaining({ code: "QUESTION_SET_ALREADY_CONFIRMED" }));
  });

  it("orderNo는 1부터 이어진다 — 화면이 번호를 지어내지 않는다", () => {
    const order = mockQuestionSetDetail("1").questions.map((q) => q.orderNo);
    expect(order).toEqual(order.map((_, i) => i + 1));
  });
});
