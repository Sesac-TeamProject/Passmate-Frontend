import type { ChoiceKey, LiveQuestion, QuestionType } from "@/features/host/types";
import { remainingMs } from "@/lib/datetime";
import type { QuestionStartedPayload, QuestionType as WireQuestionType } from "@/lib/types/dto";

const QUESTION_TYPE_MAP: Record<WireQuestionType, QuestionType> = {
  MCQ: "multiple",
  OX: "ox",
  ESSAY: "essay",
};

const CHOICE_KEYS: ChoiceKey[] = ["A", "B", "C", "D"];

/** OX는 서버 문항에 보기가 없다 — 답은 "O"/"X" 원문이므로 화면 보기를 여기서 만든다 */
const OX_CHOICES = ["O", "X"];

/**
 * 문항의 보기 원문. 객관식은 서버가 준 그대로, OX는 O·X, 서술형은 없다.
 * 호스트 진행·결과 화면과 학생 풀이 화면이 같은 보기 순서를 써야 A·B 키가 맞는다.
 */
export function choicesOf(question: Pick<QuestionStartedPayload, "type" | "choices">): string[] {
  if (question.choices && question.choices.length > 0) return question.choices;
  return question.type === "OX" ? OX_CHOICES : [];
}

/**
 * 진행 문항(`QUESTION_STARTED` 페이로드 = 스냅샷의 현재 문항) → 풀이 화면 뷰 타입.
 *
 * 남은 시간은 **서버가 준 `endsAt`에서 렌더 시점마다 다시 계산**한다 — 로컬 타이머가 만료를
 * 판정하지 않는다(규칙 §9). 스냅샷에 서버 시각이 없어져서 기준은 지금 시각이다.
 */
export function toLiveQuestion(
  question: QuestionStartedPayload,
  submittedCount: number,
): LiveQuestion {
  return {
    index: question.orderNo,
    total: question.totalCount,
    type: QUESTION_TYPE_MAP[question.type],
    prompt: question.content,
    choices: choicesOf(question).map((text, i) => ({
      key: CHOICE_KEYS[i] ?? "D",
      text,
    })),
    points: question.points,
    seconds: question.timeLimitSec,
    remaining: Math.round(remainingMs(question.endsAt) / 1000),
    submitted: submittedCount,
  };
}
