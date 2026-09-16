import { toAvatarKey } from "@/components/common/student-avatar";
import type { FinalRankRow } from "@/features/host/live/rank-columns";
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
    // 서술형은 정답 개념이 없어 정답률 대신 AI 분석 건수를 보여준다(서버도 null 로 준다).
    // 실서버는 널 필드를 빼고 보내 키 자체가 없다 — `=== null` 로만 거르면 undefined 가
    // Math.round 를 지나 NaN% 가 됐다(운영 확인, 2026-09-09). 서버는 소수로 주므로 정수로 접는다
    accuracy: q.correctRate == null ? undefined : Math.round(q.correctRate),
    aiCount: q.aiAnalysisCount,
    // 표 "오답" 열 — 객관식·OX 는 낸 사람 중 못 맞힌 수. 서술형은 자동 채점이 없어 같은 식이면
    // 제출자 전원이 오답으로 찍혔다(9/9 잔여) — 첨삭에서 0점을 받은 수만 센다
    wrongCount:
      q.type === "ESSAY" ? q.essayGrading?.zero : Math.max(0, q.submitCount - q.correctCount),
  }));

  const questionCount = dto.summary?.questionCount ?? questions.length;

  return {
    id: String(dto.roomId),
    title: dto.title,
    dateLabel: toDateLabel(dto.endedAt ?? dto.startedAt),
    stats: {
      // 소수점 첫째 자리까지 — 정수로 접으면 33.3% 와 33.4% 가 같아 보인다
      accuracy: Math.round(dto.summary.avgCorrectRate * 10) / 10,
      students: dto.summary.participantCount,
      questions: dto.summary.questionCount,
      aiAnalyses: dto.summary.aiAnalysisCount,
      // 계약에 생긴 값(2026-09-15)을 꽂는다. 구버전 서버라 키가 없으면 표가 "—"로 그린다
      submittedCount: dto.summary.submittedParticipantCount ?? null,
      completionPercent:
        dto.summary.completionRate == null ? null : Math.round(dto.summary.completionRate),
      avgElapsedSeconds:
        dto.summary.avgElapsedMs == null ? null : Math.round(dto.summary.avgElapsedMs / 1000),
      essayGradedCount: dto.summary.essayReviewedCount ?? null,
      essayTotalCount: dto.summary.essayAnswerCount ?? null,
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
 * 개요 탭 순위 — 세션 종료 화면(W-12)과 같은 표를 그린다.
 * 순위는 서버가 매긴 값을 그대로 쓰고 점수를 다시 계산하지 않는다(채점은 서버 권위).
 * 한 문항도 내지 않은 학생은 정답 수를 비운다 — 미제출과 "0개 정답"은 다르다.
 */
export function toRankRows(students: ParticipantResultRow[]): FinalRankRow[] {
  return [...students]
    .sort((a, b) => a.rank - b.rank)
    .map((student) => ({
      rank: student.rank,
      student: {
        id: String(student.participantId),
        name: student.nickname,
        avatar: toAvatarKey(student.avatarId),
      },
      score: student.totalScore,
      correctCount: student.submitCount === 0 ? null : student.correctCount,
    }));
}

/**
 * @draft 문항별 채점 분포·AI 총평 — **계약에 없다.**
 * 빈 표를 넘기면 패널이 그 칸만 접는다. 서버가 주기 시작하면 여기만 채우면 된다.
 */
/**
 * GET /rooms/{roomId}/results → 우측 문항 상세 패널 (시안 784:8983).
 *
 * 서술형은 자동 채점이 없어 **첨삭 분포**(정답·부분점수·오답)와 **AI 판단 기준**(모범답안 + 분석 집계)을,
 * 객관식·OX는 정답·오답·미제출 분포와 **문제 세트의 해설란**을 그대로 보인다.
 * 첨삭 전 서술형은 오답이 아니라 미채점으로 따로 센다 — 섞으면 채점 안 끝난 문항이 전원 오답으로 보인다.
 */
export function toQuestionInsights(dto: SessionResultsResponse): Map<string, QuestionInsight> {
  const participantCount = dto.summary.participantCount;

  return new Map(
    dto.questions.map((q) => {
      const hostComment = q.teacherComment ?? null;

      if (q.type === "ESSAY") {
        const grading = q.essayGrading;
        const insight: QuestionInsight = {
          gradingBreakdown: [
            { label: "정답", count: grading?.full ?? 0, tone: "good" },
            { label: "부분점수", count: grading?.partial ?? 0, tone: "partial" },
            { label: "오답", count: grading?.zero ?? 0, tone: "bad" },
          ],
          unreviewedCount: grading?.unreviewed ?? 0,
          criteria: {
            modelAnswer: q.answer ?? null,
            analyzedCount: q.aiInsight?.analyzedCount ?? 0,
            strengths: q.aiInsight?.commonKeyPoints ?? [],
            misses: q.aiInsight?.commonMissingPoints ?? [],
          },
          explanation: null,
          hostComment,
        };
        return [String(q.questionId), insight];
      }

      const insight: QuestionInsight = {
        gradingBreakdown: [
          { label: "정답", count: q.correctCount, tone: "good" },
          { label: "오답", count: Math.max(0, q.submitCount - q.correctCount), tone: "bad" },
          { label: "미제출", count: Math.max(0, participantCount - q.submitCount), tone: "none" },
        ],
        unreviewedCount: 0,
        criteria: null,
        explanation: { answer: q.answer ?? null, text: q.explanation ?? null },
        hostComment,
      };
      return [String(q.questionId), insight];
    }),
  );
}

/** 문항 코멘트 저장 실패 문구 */
export function toCommentSaveMessage(error: unknown): string {
  if (!AppError.isAppError(error)) return "코멘트를 저장하지 못했어요. 다시 시도해 주세요";
  if (error.kind === "NotFound") return "이 방에서 출제된 문항이 아니에요";
  return error.message;
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
