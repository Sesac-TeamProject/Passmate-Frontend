import { describe, expect, it } from "vitest";
import { toFormValues, toQuestionRequest, validateQuestionForm } from "./adapt";
import { EMPTY_QUESTION_FORM, type EditorQuestion, type QuestionFormValues } from "./types";

const mcq = (patch: Partial<QuestionFormValues> = {}): QuestionFormValues => ({
  ...EMPTY_QUESTION_FORM,
  type: "multiple",
  prompt: "지문",
  choices: ["가", "나", "다", "라"],
  answerIndex: 1,
  ...patch,
});

const editorQuestion = (patch: Partial<EditorQuestion> = {}): EditorQuestion => ({
  id: 1,
  orderNo: 1,
  type: "multiple",
  prompt: "지문",
  choices: ["가", "나", "다", "라"],
  answer: "다",
  explanation: "",
  points: 100,
  seconds: 30,
  isAiGenerated: false,
  ...patch,
});

describe("toFormValues", () => {
  it("MCQ 정답을 보기 순번(answerIndex)으로 잡는다", () => {
    expect(toFormValues(editorQuestion()).answerIndex).toBe(2);
  });

  it("정답이 보기에 없으면 고른 것이 없다", () => {
    expect(toFormValues(editorQuestion({ answer: "없는 보기" })).answerIndex).toBeNull();
  });

  it("MCQ가 아니면 순번을 쓰지 않는다", () => {
    const ox = editorQuestion({ type: "ox", choices: [], answer: "O" });
    expect(toFormValues(ox).answerIndex).toBeNull();
    expect(toFormValues(ox).answer).toBe("O");
  });
});

describe("toQuestionRequest", () => {
  it("MCQ는 고른 순번의 보기 원문을 정답으로 보낸다", () => {
    expect(toQuestionRequest(mcq()).answer).toBe("나");
  });

  it("같은 글자 보기가 있어도 고른 순번 그대로 보낸다", () => {
    const values = mcq({ choices: ["같음", "같음", "다름"], answerIndex: 1 });
    expect(toQuestionRequest(values).answer).toBe("같음");
    expect(toQuestionRequest(values).choices).toEqual(["같음", "같음", "다름"]);
  });

  it("앞에 빈 보기가 있어도 정답 원문이 흔들리지 않는다", () => {
    const values = mcq({ choices: ["", "가", "나"], answerIndex: 2 });
    expect(toQuestionRequest(values).answer).toBe("나");
    expect(toQuestionRequest(values).choices).toEqual(["가", "나"]);
  });

  it("고른 것이 없으면 answer 키를 빼고 보낸다", () => {
    expect(toQuestionRequest(mcq({ answerIndex: null }))).not.toHaveProperty("answer");
  });

  it("OX·서술형은 answer 문자열을 그대로 보낸다", () => {
    expect(toQuestionRequest(mcq({ type: "ox", answer: "O", answerIndex: null })).answer).toBe("O");
    expect(
      toQuestionRequest(mcq({ type: "essay", answer: "모범답안", answerIndex: null })).answer,
    ).toBe("모범답안");
  });
});

describe("validateQuestionForm", () => {
  it("고른 보기가 있으면 통과한다", () => {
    expect(validateQuestionForm(mcq())).toBeNull();
  });

  it("정답을 고르지 않으면 막는다", () => {
    expect(validateQuestionForm(mcq({ answerIndex: null }))).toBe("정답을 보기 중에서 골라 주세요");
  });

  it("고른 보기가 비어 있으면 막는다", () => {
    expect(validateQuestionForm(mcq({ choices: ["가", "", "다"], answerIndex: 1 }))).toBe(
      "정답으로 고른 보기가 비어 있어요",
    );
  });

  it("보기 글자가 서로 겹치면 막는다 — 정답을 원문으로 저장해 구분할 수 없다", () => {
    expect(validateQuestionForm(mcq({ choices: ["같음", "같음", "다름"], answerIndex: 0 }))).toBe(
      "보기끼리 내용이 같으면 정답을 가릴 수 없어요. 다르게 적어 주세요",
    );
  });

  it("공백만 다른 보기도 겹친 것으로 본다", () => {
    expect(validateQuestionForm(mcq({ choices: ["같음", " 같음 ", "다름"], answerIndex: 0 }))).toBe(
      "보기끼리 내용이 같으면 정답을 가릴 수 없어요. 다르게 적어 주세요",
    );
  });

  it("빈 보기 줄이 둘이어도 겹친 것으로 보지 않는다", () => {
    expect(validateQuestionForm(mcq({ choices: ["가", "나", "", ""], answerIndex: 0 }))).toBeNull();
  });
});
