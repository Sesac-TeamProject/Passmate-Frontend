import { toAvatarKey } from "@/components/common/student-avatar";
import type {
  AnswerFinding,
  EssayAnswer,
  QuestionInsight,
  QuestionType,
  ReportQuestion,
  SessionReport,
  Struggler,
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
    // 표 "오답" 열 — 낸 사람 중 못 맞힌 수. 계약이 둘 다 주므로 빼서 쓴다
    wrongCount: q.submitCount - q.correctCount,
  }));

  const questionCount = dto.summary?.questionCount ?? questions.length;

  return {
    id: String(dto.roomId),
    title: dto.title,
    dateLabel: toDateLabel(dto.endedAt ?? dto.startedAt),
    stats: {
      accuracy: dto.summary.avgCorrectRate,
      students: dto.summary.participantCount,
      questions: dto.summary.questionCount,
      aiAnalyses: dto.summary.aiAnalysisCount,
      // @draft KPI 6칸 중 계약에 없는 값들 — 지어내지 않고 비우면 표가 "—"로 그린다
      submittedCount: null,
      completionPercent: null,
      avgElapsedSeconds: null,
      essayGradedCount: null,
      essayTotalCount: null,
    },
    questions,
    strugglers: toStrugglers(dto.participants, questionCount),
  };
}

/**
 * "많이 틀린 학생" 5줄 — 정답 수가 적은 순. 한 문항도 안 낸 사람은 정답 수를 null로 두고 맨 앞에 세운다.
 * 정렬만 하고 점수를 다시 계산하지는 않는다 (채점은 서버 권위 — 규칙 문서 §1).
 */
function toStrugglers(students: ParticipantResultRow[], questionCount: number): Struggler[] {
  return [...students]
    .map((student) => ({
      id: String(student.participantId),
      name: student.nickname,
      // 미제출과 "0점"은 다르다 — 낸 게 없으면 정답 수를 비운다
      correctCount: student.submitCount === 0 ? null : student.correctCount,
      questionCount,
    }))
    .sort((a, b) => (a.correctCount ?? -1) - (b.correctCount ?? -1))
    .slice(0, 5);
}

/**
 * @draft 문항별 채점 분포·AI 총평 — **계약에 없다.**
 * 빈 표를 넘기면 패널이 그 칸만 접는다. 서버가 주기 시작하면 여기만 채우면 된다.
 */
export function toQuestionInsights(): Map<string, QuestionInsight> {
  return new Map();
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
    nickname: answer.nickname,
    questionNo: answer.orderNo,
    questionContent: answer.questionContent,
    modelAnswer: answer.modelAnswer ?? null,
    text: answer.submitted,
    findings: toFindings(answer.analysis),
    points: answer.points,
    finalScore: answer.finalScore,
    comment: answer.teacherReview?.comment ?? "",
    improvement: answer.teacherReview?.improvement ?? "",
    adjustedScore: answer.teacherReview?.adjustedScore ?? null,
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

/** 첨삭 저장 실패 문구 */
export function toReviewSaveMessage(error: unknown): string {
  if (!AppError.isAppError(error)) return "저장하지 못했어요. 다시 시도해 주세요";
  // 답안이 지워졌거나 남의 방 답안을 건드린 경우 — 목록을 다시 부르면 사라진다
  if (error.kind === "NotFound") return "이 답안을 찾을 수 없어요. 목록을 새로 고쳐 주세요";
  return error.message;
}
