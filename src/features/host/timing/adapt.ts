import type { QuestionType } from "@/features/host/types";
import { AppError } from "@/lib/types/app-error";
import { ERROR_CODES } from "@/lib/types/error-codes";
import type {
  QuestionRequest,
  QuestionResponse,
  QuestionType as WireQuestionType,
} from "@/lib/types/dto";
import type { TimingRow } from "./timing-page";

const TYPE: Record<WireQuestionType, QuestionType> = {
  MCQ: "multiple",
  ESSAY: "essay",
  OX: "ox",
};

/** 세트 문항 + 편집분 → 화면 행. 편집분이 있으면 그쪽이 이긴다 */
export function toTimingRows(
  questions: QuestionResponse[],
  edits: Record<number, number>,
): TimingRow[] {
  return questions.map((q) => ({
    questionId: q.id,
    no: q.orderNo,
    body: q.content,
    type: TYPE[q.type],
    timeLimitSec: edits[q.id] ?? q.timeLimitSec,
    points: q.points,
    // 서버에 `autoAdvance` 필드가 없다(DESIGN_GAPS D-15) — 저장되지 않는 표시값이라
    // 화면도 스위치를 잠근다. 서술형만 꺼 보이는 것은 시안 기본값이다.
    autoAdvance: q.type !== "ESSAY",
  }));
}

/**
 * 바뀐 문항만 골라 `PUT …/questions/{id}` 본문으로 만든다.
 * 문항 수정은 **전체 교체**라 안 바꾼 필드도 원래 값을 같이 실어야 지워지지 않는다.
 */
export function toChangedQuestionRequests(
  questions: QuestionResponse[],
  edits: Record<number, number>,
): { questionId: number; body: QuestionRequest }[] {
  return questions
    .filter((q) => edits[q.id] !== undefined && edits[q.id] !== q.timeLimitSec)
    .map((q) => ({
      questionId: q.id,
      body: {
        type: q.type,
        content: q.content,
        ...(q.choices ? { choices: q.choices } : {}),
        ...(q.answer ? { answer: q.answer } : {}),
        ...(q.explanation ? { explanation: q.explanation } : {}),
        ...(q.topic ? { topic: q.topic } : {}),
        ...(q.difficulty ? { difficulty: q.difficulty } : {}),
        timeLimitSec: edits[q.id],
        points: q.points,
      },
    }));
}

/** 저장 실패 문구 — 확정된 세트는 서버가 409로 막는다(확정 후 불변) */
export function toTimingErrorMessage(error: unknown): string {
  if (!AppError.isAppError(error)) return "저장하지 못했어요. 다시 시도해 주세요";
  if (error.code === ERROR_CODES.QUESTION_SET_ALREADY_CONFIRMED)
    return "확정한 세트는 시간을 바꿀 수 없어요. 새 세트를 만들어 주세요";
  return error.message;
}
