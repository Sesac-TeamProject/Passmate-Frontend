import { toAvatarKey } from "@/components/common/student-avatar";
import type {
  AnswerFinding,
  EssayAnswer,
  QuestionType,
  ReportQuestion,
  SessionReport,
  Student,
} from "@/features/host/types";
import { parseServerDateTime } from "@/lib/datetime";
import { AppError } from "@/lib/types/app-error";
import type {
  EssayAnalysisView,
  ParticipantResultRow,
  QuestionType as WireQuestionType,
  ReviewTargetAnswer,
  ReviewTargetListResponse,
  SessionResultsResponse,
} from "@/lib/types/dto";

const QUESTION_TYPE_MAP: Record<WireQuestionType, QuestionType> = {
  MCQ: "multiple",
  OX: "ox",
  ESSAY: "essay",
};

/** 서버 시각(UTC naive) → "8/22 (금)". 값이 없으면 빈 문자열 */
function toDateLabel(value: string | undefined): string {
  if (!value) return "";
  const date = parseServerDateTime(value);
  if (Number.isNaN(date.getTime())) return "";
  const weekday = new Intl.DateTimeFormat("ko-KR", { weekday: "short" }).format(date);
  return `${date.getMonth() + 1}/${date.getDate()} (${weekday})`;
}

/** GET /rooms/{roomId}/results (호스트) → W-07 상단·문항 목록 */
export function toSessionReport(dto: SessionResultsResponse): SessionReport {
  const questions: ReportQuestion[] = dto.questions.map((q) => ({
    id: String(q.questionId),
    index: q.orderNo,
    title: q.content,
    type: QUESTION_TYPE_MAP[q.type],
    // 서술형은 정답 개념이 없어 정답률 대신 AI 분석 건수를 보여준다
    accuracy: q.type === "ESSAY" ? undefined : q.correctRate,
    aiCount: q.aiAnalysisCount,
  }));

  return {
    id: String(dto.roomId),
    title: dto.title,
    dateLabel: toDateLabel(dto.endedAt ?? dto.startedAt),
    stats: {
      accuracy: dto.summary.avgCorrectRate,
      students: dto.summary.participantCount,
      questions: dto.summary.questionCount,
      aiAnalyses: dto.summary.aiAnalysisCount,
    },
    questions,
  };
}

/** 세션 결과의 학생 목록 → 분석 패널 학생 조회용. 아바타가 응답에 있어 그대로 쓴다 */
export function toReportStudents(students: ParticipantResultRow[]): Student[] {
  return students.map((s) => ({
    id: String(s.participantId),
    name: s.nickname,
    avatar: toAvatarKey(s.avatarId),
  }));
}

function toFindings(analysis: EssayAnalysisView | undefined): AnswerFinding[] {
  if (!analysis) return [];

  const findings: AnswerFinding[] = [];
  if (analysis.keyPoints.length > 0)
    findings.push({ tone: "good", text: `핵심 포함 — ${analysis.keyPoints.join(", ")}` });
  if (analysis.missingPoints.length > 0)
    findings.push({ tone: "lack", text: `부족 — ${analysis.missingPoints.join(", ")}` });
  if (analysis.suggestions.length > 0)
    findings.push({ tone: "tip", text: `제안 — ${analysis.suggestions.join(", ")}` });

  return findings;
}

function toEssayAnswer(answer: ReviewTargetAnswer): EssayAnswer {
  return {
    answerId: answer.answerId,
    studentId: String(answer.participantId),
    text: answer.submitted,
    findings: toFindings(answer.analysis),
    comment: answer.teacherReview?.comment ?? "",
    reviewed: answer.reviewed,
  };
}

/** GET /rooms/{roomId}/answers → W-07 분석 패널의 서술형 답변 목록 */
export function toEssayAnswers(dto: ReviewTargetListResponse): EssayAnswer[] {
  return dto.answers.map(toEssayAnswer);
}

/** "3/6 첨삭 완료" — 진행률 문구 */
export function toReviewProgressLabel(dto: ReviewTargetListResponse | undefined): string | null {
  if (!dto || dto.totalCount === 0) return null;
  return `${dto.reviewedCount}/${dto.totalCount} 첨삭 완료`;
}

/**
 * 첨삭 저장 실패 문구.
 * **저장 API가 아직 백엔드에 없다**(실서버 404) — NotFound는 고장이 아니라 "준비 중"이다.
 */
export function toReviewSaveMessage(error: unknown): string {
  if (!AppError.isAppError(error)) return "저장하지 못했어요. 다시 시도해 주세요";
  if (error.kind === "NotFound") return "첨삭 저장은 서버 준비 중이에요";
  return error.message;
}
