import { parseServerDateTime } from "@/lib/datetime";
import { AppError } from "@/lib/types/app-error";
import { ERROR_CODES } from "@/lib/types/error-codes";
import type {
  AnalysisStatus,
  AnswerResultView,
  EssayAnalysisView,
  MyAnswerResponse,
  QuestionResultResponse,
  QuestionType,
  RatingAvailability,
} from "@/lib/types/dto";
import type { QuestionDetail, QuestionDetailAnalysis } from "./question-detail-page";
import type { ReportKind, ReportRow, ReportVerdict } from "./report-question-table";

/** 계약의 문항 유형 → 화면 라벨 */
const TYPE_LABEL: Record<QuestionType, string> = {
  MCQ: "객관식",
  OX: "OX",
  ESSAY: "서술형",
};

/** 판정 칩 문구 — report-question-table의 VERDICT 표와 같은 말을 쓴다 */
const VERDICT_LABEL: Record<ReportVerdict, string> = {
  CORRECT: "정답",
  WRONG: "오답",
  PARTIAL: "부분",
  PENDING: "분석 중",
  UNKNOWN: "미채점",
};

/**
 * 문항 한 줄의 판정 칩.
 *
 * 서버는 `isCorrect`를 **서술형에 주지 않는다**(자동 채점하지 않는다) — 그 자리는 AI 분석 상태로
 * 대신한다. 안 낸 문항은 정오가 아니라 "미채점"이다.
 */
function toVerdict(
  question: Pick<AnswerResultView, "submitted" | "isCorrect" | "analysisStatus">,
): ReportVerdict {
  if (question.submitted === undefined) return "UNKNOWN";
  if (question.isCorrect === true) return "CORRECT";
  if (question.isCorrect === false) return "WRONG";
  // 서술형이 AI 채점을 마친 상태 — 표는 이 자리를 "부분"이라 부른다(부분 점수 판정은 서버 몫)
  if (question.analysisStatus === "DONE") return "PARTIAL";
  if (question.analysisStatus === "PENDING") return "PENDING";
  return "UNKNOWN";
}

/** 계약의 문항 유형 → 표 "유형" 칩 */
const KIND: Record<QuestionType, ReportKind> = {
  MCQ: "MULTIPLE",
  OX: "OX",
  ESSAY: "ESSAY",
};

/**
 * 개인 결과의 문항 목록 → 리포트 표 행 (시안 787:8905).
 * 서술형은 답안 원문 대신 "작성 142자"로 줄인다 — 표 한 줄에 들어가지 않는다.
 *
 * 개념·반 정답률·소요 시간은 **계약에 없다**(@draft). 지어내지 않고 비워 두면
 * 표가 그 칸을 "—"로 그린다.
 */
export function toReportRows(questions: AnswerResultView[]): ReportRow[] {
  return questions.map((question) => {
    const kind = KIND[question.type];
    const answer = question.submitted ?? "";

    return {
      questionId: question.questionId,
      no: question.orderNo,
      kind,
      concept: "",
      title: question.content,
      myAnswer: kind === "ESSAY" && answer !== "" ? `작성 ${answer.length}자` : answer,
      verdict: toVerdict(question),
      classAccuracyPercent: null,
      elapsedSeconds: null,
    };
  });
}

function toAnalysis(
  status: AnalysisStatus,
  analysis: EssayAnalysisView | undefined,
): QuestionDetailAnalysis | null {
  // DONE이 아니면 서버가 내용을 주지 않는다 — 상태만 들고 화면이 안내 문구를 고른다
  if (!analysis) return status === "NOT_REQUESTED" ? null : { status, ...EMPTY_ANALYSIS };
  return { status, ...analysis };
}

const EMPTY_ANALYSIS = { keyPoints: [], missingPoints: [], suggestions: [], summary: "" };

/**
 * 내 답안(+분석) → 문항 상세 화면.
 *
 * 배점(`points`)과 획득 점수(`score`·`finalScore`)가 둘 다 오므로 "n/m점"으로 보여 줄 수 있다 —
 * 예전에는 배점이 없어 "획득 n점"이라고만 썼다. 첨삭 보정이 있으면 `finalScore`가 우선한다.
 */
export function toQuestionDetail(
  answer: MyAnswerResponse,
  total: number,
  result: QuestionResultResponse | undefined,
): QuestionDetail {
  // 표와 같은 판정 규칙을 쓴다 — 두 화면이 같은 문항을 다르게 부르면 안 된다
  const verdict = toVerdict(answer);

  return {
    no: answer.orderNo,
    total,
    title: answer.content,
    typeLabel: TYPE_LABEL[answer.type],
    scoreLabel: `${answer.finalScore}/${answer.points}점`,
    isCorrect: answer.isCorrect === true,
    verdictLabel: VERDICT_LABEL[verdict],
    myAnswer: answer.submitted,
    correctAnswer: answer.answer ?? null,
    explanation: answer.explanation ?? null,
    analysis: toAnalysis(answer.analysisStatus, answer.analysis),
    teacherComment: answer.teacherReview?.comment ?? null,
    // 보기별 분포는 문항 결과 API가 준다(마감된 문항만). 키는 보기 원문이다
    distribution: Object.entries(result?.distribution ?? {}).map(([text, count]) => ({
      text,
      count,
      isAnswer: text === (answer.answer ?? result?.answer),
    })),
  };
}

/** 별점 시트를 열 수 있는지 + 못 여는 이유 문구 */
export function toRatingNotice(rating: RatingAvailability): string | null {
  if (rating.available) return null;

  switch (rating.blockedReason) {
    case "SESSION_NOT_ENDED":
      return "세션이 끝나면 별점을 남길 수 있어요";
    case "NO_SUBMISSION":
      return "답을 하나도 내지 않아 별점을 남길 수 없어요";
    case "WINDOW_CLOSED":
      return "평가 기간(24시간)이 지났어요";
    case "ALREADY_RATED":
      return "이미 별점을 남겼어요";
    default:
      return null;
  }
}

/** 평가 마감까지 남은 시간 안내. 마감이 없으면 null */
export function toRatingDeadlineLabel(rating: RatingAvailability): string | null {
  if (!rating.available || !rating.deadline) return null;

  const deadline = parseServerDateTime(rating.deadline).getTime();
  if (Number.isNaN(deadline)) return null;

  const hours = Math.floor((deadline - Date.now()) / 3_600_000);
  if (hours <= 0) return null;
  return `${hours}시간 안에 남길 수 있어요`;
}

/**
 * 별점 제출 실패 문구.
 * **제출 API가 아직 백엔드에 없다**(실서버 404) — NotFound는 고장이 아니라 "준비 중"이다.
 */
export function toRatingSubmitMessage(error: unknown): string {
  if (!AppError.isAppError(error)) return "보내지 못했어요. 다시 시도해 주세요";
  if (error.kind === "NotFound") return "별점 남기기는 서버 준비 중이에요";
  if (error.code === ERROR_CODES.ALREADY_RATED) return "이미 별점을 남겼어요";
  return error.message;
}
