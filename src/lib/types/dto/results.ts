import type { QuestionType, RoomState } from "./common";

export type AnswerVerdict =
  "CORRECT" | "WRONG" | "INCORRECT" | "AI_ANALYZED" | "ANALYZED" | "AI_PENDING" | "PENDING";
/** SKIPPED = 세션 시작 시 aiAnalysisEnabled=false */
export type AiFeedbackStatus = "PENDING" | "DONE" | "FAILED" | "SKIPPED";

export type AiFeedbackDto = {
  status?: AiFeedbackStatus | null;
  coveredConcepts?: string[];
  missingConcepts?: string[];
  weaknesses?: string | null;
  improvement?: string | null;
  suggestedScore?: number | null;
};
export type HostReviewDto = {
  comment?: string;
  improvement?: string | null;
  adjustedScore?: number | null;
};

export type ResultQuestionDto = {
  questionId: number;
  questionNo: number;
  title?: string;
  type?: QuestionType | null;
  verdict?: AnswerVerdict | null;
  myAnswer?: string | null;
  correctAnswer?: string | null;
  explanation?: string | null;
  earnedScore?: number;
  aiFeedback?: AiFeedbackDto | null;
  hostReview?: HostReviewDto | null;
};
/** GET /rooms/{roomId}/results/me */
export type SessionResultResponse = {
  roomTitle?: string;
  rank?: number | null;
  totalScore?: number;
  correctCount?: number;
  questionCount?: number;
  canRate?: boolean;
  isGuest?: boolean;
  questions?: ResultQuestionDto[];
};
/** GET /rooms/{roomId}/reports/me */
export type LearningReportResponse = {
  accuracyPercent?: number;
  weakTopics?: string[];
  improvementPoints?: string[];
};

export type RoomReportSummary = {
  avgAccuracyPercent?: number | null;
  studentCount?: number;
  questionCount?: number;
  aiAnalysisCount?: number;
  avgScore?: number | null;
  topScore?: number | null;
};
export type RoomReportQuestion = {
  questionId?: number;
  questionNo?: number;
  title?: string;
  type?: QuestionType | null;
  accuracyPercent?: number | null;
  aiFeedbackCount?: number | null;
};
export type RoomReportStudent = {
  participantId?: number;
  nickname?: string;
  rank?: number | null;
  totalScore?: number;
  correctCount?: number;
  isGuest?: boolean;
};
/** GET /rooms/{roomId}/results (호스트) */
export type RoomReportResponse = {
  roomTitle?: string;
  pin?: string;
  status?: RoomState | null;
  dateLabel?: string | null;
  summary?: RoomReportSummary;
  questions?: RoomReportQuestion[];
  students?: RoomReportStudent[];
};

/** @draft — 계약 없음. tasks.md T070. 서술형 답안 목록(W-07 분석 패널) */
export type EssayAnswerDto = {
  answerId: number;
  participantId: number;
  nickname: string;
  content: string;
  aiFeedback?: AiFeedbackDto | null;
  hostReview?: HostReviewDto | null;
};
/** @draft GET /rooms/{roomId}/questions/{questionId}/answers */
export type EssayAnswersResponse = { answers: EssayAnswerDto[] };
/** @draft POST /answers/{answerId}/review (FR-034) */
export type HostReviewRequest = {
  comment: string;
  improvement?: string | null;
  adjustedScore?: number | null;
};
