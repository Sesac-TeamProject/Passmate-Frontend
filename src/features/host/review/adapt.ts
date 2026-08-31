import { avatarKeyFromId } from "@/components/common/student-avatar";
import type {
  AnswerFinding,
  EssayAnswer,
  QuestionType,
  ReportQuestion,
  SessionReport,
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
  }));

  return {
    id: String(roomId),
    title: dto.roomTitle ?? "",
    dateLabel: dto.dateLabel ?? "",
    stats: {
      accuracy: dto.summary?.avgAccuracyPercent ?? 0,
      students: dto.summary?.studentCount ?? 0,
      questions: dto.summary?.questionCount ?? 0,
      aiAnalyses: dto.summary?.aiAnalysisCount ?? 0,
    },
    questions,
  };
}

/** RoomReportResponse.students → 분석 패널 학생 이름 조회용 목록. 아바타는 계약에 없어 기본값(cat)으로 접힌다 */
export function toReportStudents(students: RoomReportStudent[]): Student[] {
  return students.map((s) => ({
    id: String(s.participantId ?? 0),
    name: s.nickname ?? "",
    avatar: avatarKeyFromId(undefined),
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

/** @draft GET /rooms/{roomId}/questions/{questionId}/answers → W-07 분석 패널 서술형 답변 목록 */
export function toEssayAnswers(dto: EssayAnswersResponse): EssayAnswer[] {
  return (dto.answers ?? []).map(toEssayAnswer);
}
