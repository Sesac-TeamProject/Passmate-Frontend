import type { ChoiceKey, LiveQuestion, QuestionType } from "@/features/host/types";
import { remainingMs } from "@/lib/datetime";
import type {
  QuestionEndedPayload,
  QuestionStartedPayload,
  QuestionType as WireQuestionType,
} from "@/lib/types/dto";

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
    endsAt: question.endsAt,
    submitted: submittedCount,
  };
}

/** 마감된 문항에서 학생이 보는 결과 — 내 답이 맞았는지, 정답은 무엇인지, 해설 */
export type RevealView = {
  /**
   * `correct` 맞힘 · `wrong` 틀림 · `missed` 제출 안 함 ·
   * `submitted` 냈지만 어느 보기였는지 모름(재접속 뒤) · `essay` 서술형(정오 없음)
   */
  outcome: "correct" | "wrong" | "missed" | "submitted" | "essay";
  /** 정답 보기 순번(객관식·OX). 서술형이거나 보기에서 못 찾으면 null */
  correctIndex: number | null;
  /** 서술형 모범 답안. 객관식·OX는 null */
  modelAnswer: string | null;
  explanation: string | null;
};

/**
 * `QUESTION_ENDED` 페이로드 → 학생 풀이 카드의 마감 결과.
 *
 * 마감 뒤 다음 문항이 열리기까지(자동 넘김이면 5초, 아니면 선생님이 열 때까지) 학생 화면이
 * 00:00 에 멈춘 문제만 보여 주고 있었다 — 정답·해설은 마감 페이로드에만 실리는데 학생 쪽이
 * 그 값을 그리지 않았다(2026-09-09 시나리오 테스트 S-01 "문항 마감 → 정답 공개").
 *
 * `answer`는 객관식이면 **정답 보기의 원문**, OX면 "O"/"X", 서술형이면 모범 답안 본문이다 —
 * 호스트 결과 화면(`toQuestionResult`)과 같은 규칙으로 보기 순번을 찾는다.
 */
export function toRevealView(
  reveal: Pick<QuestionEndedPayload, "answer" | "explanation">,
  question: Pick<LiveQuestion, "type" | "choices">,
  selected: number | null,
  hasSubmitted: boolean,
): RevealView {
  const explanation = reveal.explanation?.trim() ? reveal.explanation : null;
  if (question.type === "essay") {
    return { outcome: "essay", correctIndex: null, modelAnswer: reveal.answer ?? null, explanation };
  }

  const found = question.choices.findIndex((c) => c.text === reveal.answer);
  const correctIndex = found >= 0 ? found : null;
  const outcome = !hasSubmitted
    ? "missed"
    : selected === null
      ? "submitted"
      : selected === correctIndex
        ? "correct"
        : "wrong";
  return { outcome, correctIndex, modelAnswer: null, explanation };
}
