import type { QuestionType } from "@/features/host/types";
import type {
  QuestionRequest,
  QuestionResponse,
  QuestionType as WireQuestionType,
} from "@/lib/types/dto";
import { AppError } from "@/lib/types/app-error";
import { ERROR_CODES } from "@/lib/types/error-codes";
import type { EditorQuestion, QuestionFormValues } from "./types";

/** 서버 유형 ↔ 화면 유형. 서버는 `MCQ`, 화면은 `multiple`이다 */
const VIEW_TYPE: Record<WireQuestionType, QuestionType> = {
  MCQ: "multiple",
  OX: "ox",
  ESSAY: "essay",
};
const WIRE_TYPE: Record<QuestionType, WireQuestionType> = {
  multiple: "MCQ",
  ox: "OX",
  essay: "ESSAY",
};

/** GET /question-sets/{id}.questions → W-03 우측 문항 목록 */
export function toEditorQuestions(questions: QuestionResponse[]): EditorQuestion[] {
  return questions.map((q) => ({
    id: q.id,
    orderNo: q.orderNo,
    type: VIEW_TYPE[q.type],
    prompt: q.content,
    choices: q.choices ?? [],
    answer: q.answer ?? "",
    explanation: q.explanation ?? "",
    points: q.points,
    seconds: q.timeLimitSec,
    isAiGenerated: q.source === "AI",
  }));
}

/** 편집 시작값 — 저장 폼에 기존 문항을 그대로 채운다 */
export function toFormValues(question: EditorQuestion): QuestionFormValues {
  return {
    type: question.type,
    prompt: question.prompt,
    // MCQ 보기는 최소 2줄을 보여 준다 — 빈 줄은 저장할 때 버린다
    choices: question.choices.length >= 2 ? question.choices : ["", ""],
    answer: question.answer,
    explanation: question.explanation,
    points: question.points,
    seconds: question.seconds,
  };
}

/**
 * 폼 입력 → `QuestionRequest`.
 * 값이 없는 필드는 **키를 아예 빼서** 보낸다 — 서버가 `null`을 검증에 걸 수 있다(R-4).
 */
export function toQuestionRequest(values: QuestionFormValues): QuestionRequest {
  const type = WIRE_TYPE[values.type];
  const choices = values.choices.map((c) => c.trim()).filter((c) => c !== "");
  const answer = values.answer.trim();
  const explanation = values.explanation.trim();

  return {
    type,
    content: values.prompt.trim(),
    ...(type === "MCQ" ? { choices } : {}),
    ...(answer ? { answer } : {}),
    ...(explanation ? { explanation } : {}),
    timeLimitSec: values.seconds,
    points: values.points,
  };
}

/**
 * 서버가 400으로 막는 규칙과 같은 값을 화면에서 먼저 본다(`data-model.md` §4).
 * 통과하면 null, 걸리면 문구를 돌려준다.
 */
export function validateQuestionForm(values: QuestionFormValues): string | null {
  if (values.prompt.trim() === "") return "문항 지문을 입력해 주세요";
  if (values.seconds < 5 || values.seconds > 600) return "제한 시간은 5~600초 사이여야 해요";
  if (values.points < 1 || values.points > 1000) return "배점은 1~1000점 사이여야 해요";

  if (values.type === "multiple") {
    const choices = values.choices.map((c) => c.trim()).filter((c) => c !== "");
    if (choices.length < 2) return "객관식 보기는 2개 이상 필요해요";
    if (values.answer.trim() === "") return "정답을 보기 중에서 골라 주세요";
    if (!choices.includes(values.answer.trim())) return "정답은 보기 중 하나여야 해요";
  }
  if (values.type === "ox" && !["O", "X"].includes(values.answer.trim()))
    return "OX 정답은 O 또는 X여야 해요";
  if (values.type === "essay" && values.answer.trim() === "")
    return "서술형은 모범답안이 있어야 채점할 수 있어요";

  return null;
}

/** 순서 바꾸기 — 위/아래로 한 칸. `PUT /question-sets/{id}`의 `questionOrder`로 보낼 id 배열을 만든다 */
export function movedQuestionOrder(
  questions: EditorQuestion[],
  questionId: number,
  direction: "up" | "down",
): number[] | null {
  const index = questions.findIndex((q) => q.id === questionId);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= questions.length) return null;

  const ids = questions.map((q) => q.id);
  [ids[index], ids[target]] = [ids[target], ids[index]];
  return ids;
}

/** 세트 확정 실패 문구 — 서버 `code`로 분기한다 */
export function toConfirmErrorMessage(error: unknown): string {
  if (!AppError.isAppError(error)) return "확정하지 못했어요. 다시 시도해 주세요";
  if (error.code === ERROR_CODES.QUESTION_SET_EMPTY)
    return "문항이 하나도 없어요. 문항을 먼저 추가해 주세요";
  if (error.code === ERROR_CODES.QUESTION_SET_ALREADY_CONFIRMED) return "이미 확정한 세트예요";
  return error.message;
}

/** 문항 추가·수정·삭제 실패 문구 */
export function toQuestionErrorMessage(error: unknown): string {
  if (!AppError.isAppError(error)) return "저장하지 못했어요. 다시 시도해 주세요";
  if (error.code === ERROR_CODES.QUESTION_SET_ALREADY_CONFIRMED)
    return "확정한 세트의 문항은 고칠 수 없어요";
  if (error.code === ERROR_CODES.INVALID_QUESTION) return "문항 내용을 다시 확인해 주세요";
  return error.message;
}
