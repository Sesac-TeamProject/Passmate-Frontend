import type { ChoiceKey, LiveQuestion, QuestionType } from "@/features/host/types";
import type { SnapshotQuestion } from "@/lib/types/dto";

const QUESTION_TYPE_MAP: Record<string, QuestionType> = {
  MCQ: "multiple",
  OX: "ox",
  ESSAY: "essay",
};

const CHOICE_KEYS: ChoiceKey[] = ["A", "B", "C", "D"];

/**
 * 세션 스냅샷의 진행 문항 → 풀이 화면 뷰 타입.
 * remaining은 항상 서버 시각(endsAt − serverTs) 기준으로 렌더 시점에 다시 계산한다 — 로컬 타이머가 만료를 판정하지 않는다.
 */
export function toLiveQuestion(
  question: SnapshotQuestion,
  questionCount: number | null,
  serverTs: string | null,
  submitted: { submittedCount: number; totalCount: number },
): LiveQuestion {
  const endsAtMs = Date.parse(question.endsAt);
  const serverMs = serverTs ? Date.parse(serverTs) : NaN;
  const remaining =
    Number.isNaN(endsAtMs) || Number.isNaN(serverMs)
      ? 0
      : Math.max(0, Math.round((endsAtMs - serverMs) / 1000));

  return {
    index: question.questionNo,
    total: questionCount ?? question.questionNo,
    type: QUESTION_TYPE_MAP[question.type ?? "MCQ"] ?? "multiple",
    prompt: question.body,
    choices: (question.choices ?? []).map((text, i) => ({
      key: CHOICE_KEYS[i] ?? "D",
      text,
    })),
    seconds: question.timeLimitSec ?? 0,
    remaining,
    submitted: submitted.submittedCount,
  };
}
