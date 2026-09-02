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
import type {
  AiFeedbackDto,
  EssayAnswerDto,
  EssayAnswersResponse,
  RoomReportResponse,
  RoomReportStudent,
} from "@/lib/types/dto";

const QUESTION_TYPE_MAP: Record<string, QuestionType> = {
  MULTIPLE_CHOICE: "multiple",
  OX: "ox",
  ESSAY: "essay",
};

/** GET /rooms/{roomId}/results (호스트) → W-07 상단·문항 목록. roomId는 계약에 없어 컨테이너가 넘겨준다 */
export function toSessionReport(dto: RoomReportResponse, roomId: number): SessionReport {
  const questions: ReportQuestion[] = (dto.questions ?? []).map((q) => ({
    id: String(q.questionId ?? 0),
    index: q.questionNo ?? 0,
    title: q.title ?? "",
    type: QUESTION_TYPE_MAP[q.type ?? "MULTIPLE_CHOICE"] ?? "multiple",
    accuracy: q.accuracyPercent ?? undefined,
    aiCount: q.aiFeedbackCount ?? undefined,
    wrongCount: q.wrongCount ?? undefined,
    prompt: q.prompt ?? undefined,
  }));

  const questionCount = dto.summary?.questionCount ?? questions.length;

  return {
    id: String(roomId),
    title: dto.roomTitle ?? "",
    dateLabel: dto.dateLabel ?? "",
    stats: {
      accuracy: dto.summary?.avgAccuracyPercent ?? 0,
      students: dto.summary?.studentCount ?? 0,
      questions: questionCount,
      aiAnalyses: dto.summary?.aiAnalysisCount ?? 0,
      submittedCount: dto.summary?.submittedCount ?? null,
      completionPercent: dto.summary?.completionPercent ?? null,
      avgElapsedSeconds: dto.summary?.avgElapsedSeconds ?? null,
      essayGradedCount: dto.summary?.essayGradedCount ?? null,
      essayTotalCount: dto.summary?.essayTotalCount ?? null,
    },
    questions,
    strugglers: toStrugglers(dto.students ?? [], questionCount),
  };
}

/**
 * "많이 틀린 학생" 5줄 — 정답 수가 적은 순. 미제출(isMissing)은 정답 수를 null로 두고 맨 앞에 세운다.
 * 정렬만 하고 점수를 다시 계산하지는 않는다 (채점은 서버 권위 — 규칙 문서 §1).
 */
function toStrugglers(students: RoomReportStudent[], questionCount: number): Struggler[] {
  return [...students]
    .map((student) => ({
      id: String(student.participantId ?? 0),
      name: student.nickname ?? "",
      correctCount: student.isMissing === true ? null : (student.correctCount ?? 0),
      questionCount,
    }))
    .sort((a, b) => (a.correctCount ?? -1) - (b.correctCount ?? -1))
    .slice(0, 5);
}

/** @draft 문항별 채점 분포·AI 총평 — 서버가 안 주면 빈 표가 되고 패널은 그 칸만 접는다 */
export function toQuestionInsights(dto: RoomReportResponse): Map<string, QuestionInsight> {
  const entries = (dto.insights ?? []).map(
    (insight) =>
      [
        String(insight.questionId),
        {
          gradingBreakdown: insight.gradingBreakdown ?? [],
          strengths: insight.strengths ?? null,
          commonMisses: insight.commonMisses ?? null,
          nextRoomSuggestion: insight.nextRoomSuggestion ?? null,
          hostComment: insight.hostComment ?? null,
        },
      ] as const,
  );

  return new Map(entries);
}

/** RoomReportResponse.students → 분석 패널 학생 이름 조회용 목록. 아바타는 계약에 없어 기본값(cat)으로 접힌다 */
export function toReportStudents(students: RoomReportStudent[]): Student[] {
  return students.map((s) => ({
    id: String(s.participantId ?? 0),
    name: s.nickname ?? "",
    avatar: toAvatarKey(undefined),
  }));
}

function toFindings(feedback: AiFeedbackDto | null | undefined): AnswerFinding[] {
  if (!feedback) return [];
  const findings: AnswerFinding[] = [];
  const covered = feedback.coveredConcepts ?? [];
  const missing = feedback.missingConcepts ?? [];

  if (covered.length > 0)
    findings.push({ tone: "good", text: `핵심 포함 — ${covered.join(", ")}` });
  if (missing.length > 0) findings.push({ tone: "lack", text: `부족 — ${missing.join(", ")}` });
  if (feedback.improvement) findings.push({ tone: "tip", text: `제안 — ${feedback.improvement}` });

  return findings;
}

function toEssayAnswer(dto: EssayAnswerDto): EssayAnswer {
  return {
    studentId: String(dto.participantId),
    text: dto.content ?? "",
    findings: toFindings(dto.aiFeedback),
  };
}

/** @draft GET /rooms/{roomId}/answers → W-07 분석 패널 서술형 답변 목록 (응답 필드 미확보) */
export function toEssayAnswers(dto: EssayAnswersResponse): EssayAnswer[] {
  return (dto.answers ?? []).map(toEssayAnswer);
}
