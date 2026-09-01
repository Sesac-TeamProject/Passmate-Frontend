import type { Question, QuestionType } from "@/features/host/types";
import type { QuestionDraft } from "@/lib/types/dto";
import { AppError } from "@/lib/types/app-error";
import { ERROR_CODES } from "@/lib/types/error-codes";

const DRAFT_TYPE_MAP: Record<string, QuestionType> = {
  MULTIPLE_CHOICE: "multiple",
  OX: "ox",
  ESSAY: "essay",
};

/** @draft QuestionSetDetailResponse.questions → W-03 우측 문항 검토 목록 */
export function toEditorQuestions(drafts: QuestionDraft[]): Question[] {
  return drafts.map((d) => ({
    id: String(d.questionId),
    type: DRAFT_TYPE_MAP[d.type] ?? "multiple",
    prompt: d.body,
    points: d.points,
    seconds: d.timeLimitSec,
  }));
}

/** POST /question-sets/{setId}/questions/generate 실패 문구. 코인 부족·생성 실패는 서버 code로 분기한다 */
export function toGenerateErrorMessage(error: unknown): string {
  if (!AppError.isAppError(error)) return "생성에 실패했어요. 다시 요청해 주세요";
  if (error.code === ERROR_CODES.INSUFFICIENT_COINS)
    return "코인이 부족해요. 충전하거나 직접 작성해 주세요";
  if (error.code === ERROR_CODES.AI_GENERATION_FAILED)
    return "생성에 실패했어요. 다시 요청해 주세요";
  return error.message;
}
