import type { QuestionType } from "@/features/host/types";
import { AppError } from "@/lib/types/app-error";
import { ERROR_CODES } from "@/lib/types/error-codes";
import type {
  QuestionType as WireQuestionType,
  RoomQuestionTimeView,
  RoomQuestionTimesRequest,
} from "@/lib/types/dto";
import type { TimingRow } from "./timing-page";

const TYPE: Record<WireQuestionType, QuestionType> = {
  MCQ: "multiple",
  ESSAY: "essay",
  OX: "ox",
};

/** 저장 전 편집분 — 문항 id → 바꾼 값. 없는 필드는 서버 값 그대로다 */
export type TimingEdit = { timeLimitSec?: number; autoAdvance?: boolean };
export type TimingEdits = Record<number, TimingEdit>;

/** 문항 하나의 "지금 화면에 보이는 값" — 편집분이 있으면 그쪽, 없으면 서버가 준 방 값 */
function effective(q: RoomQuestionTimeView, edits: TimingEdits) {
  const edit = edits[q.questionId];
  return {
    timeLimitSec: edit?.timeLimitSec ?? q.timeLimitSec,
    autoAdvance: edit?.autoAdvance ?? q.autoAdvance,
  };
}

/** 서버 문항 줄(방 값이 얹힌 것) + 편집분 → 화면 행 */
export function toTimingRows(questions: RoomQuestionTimeView[], edits: TimingEdits): TimingRow[] {
  return questions.map((q) => ({
    questionId: q.questionId,
    no: q.orderNo,
    body: q.content,
    type: TYPE[q.type],
    ...effective(q, edits),
  }));
}

/** 편집분이 서버 값과 하나라도 다른가 — 같으면 저장할 이유가 없다 */
export function hasTimingChanges(questions: RoomQuestionTimeView[], edits: TimingEdits): boolean {
  return questions.some((q) => {
    const now = effective(q, edits);
    return now.timeLimitSec !== q.timeLimitSec || now.autoAdvance !== q.autoAdvance;
  });
}

/**
 * `PUT /rooms/{roomId}/question-times` 본문. **전체 교체**라 바뀐 문항만이 아니라 이 방이
 * 덮어쓸 문항 전부를 싣는다 — 세트 기본값 그대로이고 자동 넘김도 꺼진 문항은 뺀다(본문에 없는
 * 문항은 서버가 기본값으로 돌린다). 손대지 않은 문항의 자동 넘김도 서버 값 그대로 다시 싣는다 —
 * 빼먹으면 켜 둔 문항이 꺼진다.
 */
export function toQuestionTimesRequest(
  questions: RoomQuestionTimeView[],
  edits: TimingEdits,
): RoomQuestionTimesRequest {
  return {
    times: questions.flatMap((q) => {
      const { timeLimitSec, autoAdvance } = effective(q, edits);
      if (timeLimitSec === q.defaultTimeLimitSec && !autoAdvance) return [];
      return [{ questionId: q.questionId, timeLimitSec, autoAdvance }];
    }),
  };
}

/** 저장 실패 문구 — 시작한 방은 서버가 409 `CONFLICT`로 막는다(대기 중에만 바꿀 수 있다) */
export function toTimingErrorMessage(error: unknown): string {
  if (!AppError.isAppError(error)) return "저장하지 못했어요. 다시 시도해 주세요";
  if (error.code === ERROR_CODES.CONFLICT) return "시작한 방은 시간을 바꿀 수 없어요";
  if (error.code === ERROR_CODES.QUESTION_SET_REQUIRED)
    return "이 방에 연결된 문제 세트를 찾지 못했어요";
  return error.message;
}
