import type { QuestionType } from "@/features/host/types";
import type { QuestionDraft } from "@/lib/types/dto";
import type { TimingRow } from "./timing-page";

const TYPE: Record<QuestionDraft["type"], QuestionType> = {
  MULTIPLE_CHOICE: "multiple",
  ESSAY: "essay",
  OX: "ox",
};

/** 세트 문항 + 편집분 → 화면 행. 편집분이 있으면 그쪽이 이긴다 */
export function toTimingRows(
  questions: QuestionDraft[],
  edits: Record<number, { timeLimitSec: number; autoAdvance: boolean }>,
): TimingRow[] {
  return questions.map((q) => {
    const edit = edits[q.questionId];
    return {
      questionId: q.questionId,
      no: q.questionNo,
      body: q.body,
      type: TYPE[q.type],
      timeLimitSec: edit?.timeLimitSec ?? q.timeLimitSec,
      // 계약에 없는 필드라 값이 없으면 서술형만 꺼 둔다 (DESIGN_GAPS D-15)
      autoAdvance: edit?.autoAdvance ?? q.autoAdvance ?? q.type !== "ESSAY",
    };
  });
}
