import type {
  AiFeedbackDto,
  AnswerVerdict,
  QuestionType,
  ResultQuestionDto,
} from "@/lib/types/dto";
import type { QuestionDetail } from "./question-detail-page";
import type { ReportKind, ReportRow, ReportVerdict } from "./report-question-table";

/**
 * 계약의 판정값은 서버 버전에 따라 두 벌로 온다 — 화면 칩 5종으로 좁힌다.
 * 계약에 PARTIAL은 없다. 시안이 AI 채점된 서술형을 "부분"이라 부르므로 라벨만 그 말을 쓰고,
 * 부분 점수 여부를 클라이언트가 판정하지는 않는다 (채점은 서버 권위 — 규칙 문서 §1).
 */
const VERDICT: Record<AnswerVerdict, ReportVerdict> = {
  CORRECT: "CORRECT",
  WRONG: "WRONG",
  INCORRECT: "WRONG",
  AI_ANALYZED: "PARTIAL",
  ANALYZED: "PARTIAL",
  AI_PENDING: "PENDING",
  PENDING: "PENDING",
};

/** 판정 칩 문구 — report-question-table의 VERDICT 표와 같은 말을 쓴다 */
const VERDICT_LABEL: Record<ReportVerdict, string> = {
  CORRECT: "정답",
  WRONG: "오답",
  PARTIAL: "부분",
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

/** 계약의 문항 유형 → 표 "유형" 칩 */
const KIND: Record<QuestionType, ReportKind> = {
  MULTIPLE_CHOICE: "MULTIPLE",
  OX: "OX",
  ESSAY: "ESSAY",
};

/**
 * 개인 결과의 문항 목록 → 리포트 표 행 (시안 787:8905).
 * 서술형은 답안 원문 대신 "작성 142자"로 줄인다 — 표 한 줄에 들어가지 않는다.
 */
export function toReportRows(questions: ResultQuestionDto[]): ReportRow[] {
  return questions.map((question) => {
    const kind = question.type ? KIND[question.type] : "MULTIPLE";
    const answer = question.myAnswer ?? "";

    return {
      questionId: question.questionId,
      no: question.questionNo,
      kind,
      concept: question.concept ?? "",
      title: question.title ?? "",
      myAnswer: kind === "ESSAY" && answer !== "" ? `작성 ${answer.length}자` : answer,
      verdict: question.verdict ? VERDICT[question.verdict] : "UNKNOWN",
      classAccuracyPercent: question.classAccuracyPercent ?? null,
      elapsedSeconds: question.elapsedSeconds ?? null,
    };
  });
}

/** 계약의 문항 유형 → 화면 라벨 */
const TYPE_LABEL: Record<QuestionType, string> = {
  MULTIPLE_CHOICE: "객관식",
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
    choices: (question.choiceDistribution ?? []).map((choice) => ({
      label: choice.label,
      count: choice.count,
      isCorrect: choice.isCorrect === true,
    })),
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
