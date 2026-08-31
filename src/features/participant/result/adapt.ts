import type { AiFeedbackDto, AnswerVerdict, ResultQuestionDto } from "@/lib/types/dto";
import type { ReportFeedback, ReportQuestion, ReportVerdict } from "./report-page";

/** 계약의 판정값은 서버 버전에 따라 두 벌로 온다 — 화면 칩 5종으로 좁힌다 */
const VERDICT: Record<AnswerVerdict, ReportVerdict> = {
  CORRECT: "CORRECT",
  WRONG: "WRONG",
  INCORRECT: "WRONG",
  AI_ANALYZED: "AI_ANALYZED",
  ANALYZED: "AI_ANALYZED",
  AI_PENDING: "PENDING",
  PENDING: "PENDING",
};

function joinConcepts(concepts: string[] | undefined): string | null {
  if (concepts === undefined || concepts.length === 0) return null;

  return concepts.join(", ");
}

/** status가 비어 있어도 내용이 있으면 분석이 끝난 것으로 본다 */
function isDone(feedback: AiFeedbackDto): boolean {
  const hasContent =
    joinConcepts(feedback.coveredConcepts) !== null ||
    joinConcepts(feedback.missingConcepts) !== null ||
    Boolean(feedback.improvement);

  return feedback.status === "DONE" || ((feedback.status ?? null) === null && hasContent);
}

/** 개인 결과의 문항 목록 → 리포트 문항 행 */
export function toReportQuestions(questions: ResultQuestionDto[]): ReportQuestion[] {
  return questions.map((question) => ({
    questionId: question.questionId,
    no: question.questionNo,
    title: question.title ?? "",
    verdict: question.verdict ? VERDICT[question.verdict] : "UNKNOWN",
  }));
}

/**
 * 하단 AI 분석 카드에 세울 문항을 고른다 — 분석이 끝난 첫 문항, 없으면 대기 중인 첫 문항.
 * 시안에는 서술형 한 문항만 열려 있고 문항을 바꿀 방법이 없다(셰브론이 갈 곳이 없다).
 */
export function toReportFeedback(questions: ResultQuestionDto[]): ReportFeedback | null {
  const done = questions.find((q) => q.aiFeedback && isDone(q.aiFeedback));
  const pending = questions.find((q) => q.aiFeedback?.status === "PENDING");
  const target = done ?? pending;

  if (target === undefined || !target.aiFeedback) return null;

  return {
    heading: `Q${target.questionNo} · AI 분석 (참고 의견)`,
    isPending: done === undefined,
    covered: joinConcepts(target.aiFeedback.coveredConcepts),
    missing: joinConcepts(target.aiFeedback.missingConcepts),
    improvement: target.aiFeedback.improvement ?? null,
    hostComment: target.hostReview?.comment ?? null,
  };
}
