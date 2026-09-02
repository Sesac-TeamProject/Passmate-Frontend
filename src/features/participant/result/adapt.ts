import type {
  AiFeedbackDto,
  AnswerVerdict,
  QuestionType,
  ResultQuestionDto,
} from "@/lib/types/dto";
import type { QuestionDetail } from "./question-detail-page";
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

/** 판정 칩 문구 — report-page의 VERDICT 표와 같은 말을 쓴다 */
const VERDICT_LABEL: Record<ReportVerdict, string> = {
  CORRECT: "정답",
  WRONG: "오답",
  AI_ANALYZED: "AI 분석",
  PENDING: "분석 중",
  UNKNOWN: "미채점",
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

/** 계약의 문항 유형 → 화면 라벨 */
const TYPE_LABEL: Record<QuestionType, string> = {
  MCQ: "객관식",
  OX: "OX",
  ESSAY: "서술형",
};

/**
 * 문항 하나 → 문항 상세 화면(P-Web).
 * 시안은 "객관식 · 1점"처럼 배점을 쓰는데 계약에 배점이 없고 earnedScore(획득 점수)만 있다.
 * 그대로 "1점"이라 쓰면 오답일 때 "0점"이 배점처럼 보이므로 "획득"임을 밝힌다.
 */
export function toQuestionDetail(
  questions: ResultQuestionDto[],
  no: number,
): QuestionDetail | null {
  const question = questions.find((q) => q.questionNo === no);
  if (question === undefined) return null;

  const verdict = question.verdict ? VERDICT[question.verdict] : "UNKNOWN";
  const feedback = question.aiFeedback;

  return {
    no,
    total: questions.length,
    title: question.title ?? "",
    typeLabel: question.type ? TYPE_LABEL[question.type] : "",
    scoreLabel: question.earnedScore === undefined ? null : `획득 ${question.earnedScore}점`,
    isCorrect: verdict === "CORRECT",
    verdictLabel: VERDICT_LABEL[verdict],
    myAnswer: question.myAnswer ?? null,
    correctAnswer: question.correctAnswer ?? null,
    explanation: question.explanation ?? null,
    feedback:
      feedback && isDone(feedback)
        ? {
            covered: joinConcepts(feedback.coveredConcepts),
            missing: joinConcepts(feedback.missingConcepts),
            improvement: feedback.improvement ?? null,
          }
        : null,
  };
}
