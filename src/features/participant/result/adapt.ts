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

/**
 * "AI 분석 요청" 버튼을 보일지.
 *
 * 서술형이고 회원일 때만이다 — 게스트는 눌러도 403이라 버튼이 거짓말이 된다.
 * 상태로는 `NOT_REQUESTED`·`FAILED` 둘뿐이다. 이미 걸린 건(`PENDING`)과 끝난 건(`DONE`)은
 * 서버가 **차감 없이 그대로 돌려주므로**(`EssayAnalysisService.request`) 눌러도 화면이 그대로다.
 */
export function canRequestAnalysis(
  type: QuestionType,
  isMember: boolean,
  status: AnalysisStatus,
): boolean {
  if (type !== "ESSAY" || !isMember) return false;
  return status === "NOT_REQUESTED" || status === "FAILED";
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
 *
 * 서버가 막는 이유가 넷이고 문구가 다 다르다(`RatingBlockedReason`과 같은 판정을 쓴다).
 * 코드로 갈라 주지 않으면 "권한이 없어요"·"이미 처리된 요청이에요" 같은 엉뚱한 기본 문구가 뜬다.
 */
export function toRatingSubmitMessage(error: unknown): string {
  if (!AppError.isAppError(error)) return "보내지 못했어요. 다시 시도해 주세요";
  // 방이 지워졌거나 참여하지 않은 방인 경우
  if (error.kind === "NotFound") return "이 방을 찾을 수 없어요";
  if (error.code === ERROR_CODES.ALREADY_RATED) return "이미 별점을 남겼어요";
  if (error.code === ERROR_CODES.RATING_WINDOW_CLOSED) return "평가 기간이 지났어요";
  if (error.code === ERROR_CODES.RATING_NOT_ALLOWED) return "답안을 낸 학생만 평가할 수 있어요";
  if (error.code === ERROR_CODES.SESSION_NOT_ENDED) return "수업이 끝난 뒤에 남길 수 있어요";
  return error.message;
}

/**
 * 리포트 머리의 순위 문구. 총원은 `MySessionResultResponse`에 없어 보통 null이다 —
 * 순위가 있으면 순위만 적고, 순위 자체가 없을 때만 "집계 중"이다.
 */
export function toRankText(rank: number | null, participantCount: number | null): string {
  if (rank === null) return "집계 중";
  return participantCount === null ? `${rank}위` : `${rank}위 / ${participantCount}명`;
}
