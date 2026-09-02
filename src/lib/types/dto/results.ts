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

/** @draft 보기 하나에 몇 명이 답했는지 — label은 보기 원문 */
export type ChoiceCountDto = { label: string; count: number; isCorrect?: boolean };

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
  /** @draft 문항이 다루는 개념 이름 — 리포트 표 "개념" 열 (시안 787:8920) */
  concept?: string | null;
  /** @draft 이 문항의 방 전체 정답률 — 리포트 표 "반 정답률" 열 */
  classAccuracyPercent?: number | null;
  /** @draft 내가 이 문항에 쓴 시간(초) — 리포트 표 "소요" 열 */
  elapsedSeconds?: number | null;
  /** @draft 보기별 응답 인원 — 문항 상세 "다른 학생들은" (시안 620:8221). 없으면 그 칸을 감춘다 */
  choiceDistribution?: ChoiceCountDto[];
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
/** @draft 반 평균 대비 내 위치 — 리포트 "반 평균과 비교" 카드 (시안 787:8862) */
export type ReportComparisonDto = {
  myPercent: number;
  classAveragePercent: number;
  topPercent: number;
};
/** @draft 회차별 추이 한 점 — label은 "1회차"처럼 서버가 만든 표기 */
export type ReportTrendPointDto = { label: string; accuracyPercent: number };
/** @draft 개념별 맞힌 수 — 리포트 "개념별 정답률" 카드 */
export type ReportConceptDto = { name: string; correctCount: number; questionCount: number };

/** GET /rooms/{roomId}/reports/me */
export type LearningReportResponse = {
  accuracyPercent?: number;
  weakTopics?: string[];
  improvementPoints?: string[];
  /** @draft 헤더 부제 "8/22 (금) · 3회차 참여 · 문항 8개"에 쓰는 값들 */
  dateLabel?: string | null;
  attemptCount?: number | null;
  /** @draft 헤더 "3위 / 24명"의 분모 */
  participantCount?: number | null;
  /** @draft 헤더 "소요 시간" — 세션 전체 */
  elapsedSeconds?: number | null;
  /** @draft 분석 카드 3장. 없으면 해당 카드를 숨긴다 */
  comparison?: ReportComparisonDto | null;
  trend?: ReportTrendPointDto[];
  concepts?: ReportConceptDto[];
};

export type RoomReportSummary = {
  avgAccuracyPercent?: number | null;
  studentCount?: number;
  questionCount?: number;
  aiAnalysisCount?: number;
  avgScore?: number | null;
  topScore?: number | null;
  /** @draft W-07 KPI 6칸 (시안 784:8863) — 없는 칸은 "—"로 둔다 */
  submittedCount?: number | null;
  completionPercent?: number | null;
  avgElapsedSeconds?: number | null;
  essayGradedCount?: number | null;
  essayTotalCount?: number | null;
};
export type RoomReportQuestion = {
  questionId?: number;
  questionNo?: number;
  title?: string;
  type?: QuestionType | null;
  accuracyPercent?: number | null;
  aiFeedbackCount?: number | null;
  /** @draft 이 문항을 틀린 학생 수 — W-07 표 "오답" 열 */
  wrongCount?: number | null;
  /** @draft 문항 원문(표 제목보다 긴 전문) — 우측 상세 패널 머리글 */
  prompt?: string | null;
};
export type RoomReportStudent = {
  participantId?: number;
  nickname?: string;
  rank?: number | null;
  totalScore?: number;
  correctCount?: number;
  isGuest?: boolean;
  /** @draft 미제출이면 true — W-07 "많이 틀린 학생"이 "미제출"로 적는다 */
  isMissing?: boolean | null;
};

/** @draft 문항 하나의 채점 분포·AI 총평 — W-07 우측 상세 패널 (시안 784:8983) */
export type RoomQuestionInsightDto = {
  questionId: number;
  /** 채점 현황 막대 — 라벨은 서버 문구 그대로 쓴다 */
  gradingBreakdown?: { label: string; count: number }[];
  /** AI 분석 (참고 의견) 3항 */
  strengths?: string | null;
  commonMisses?: string | null;
  nextRoomSuggestion?: string | null;
  /** 이미 저장된 선생님 코멘트 */
  hostComment?: string | null;
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
  /** @draft 문항별 채점 분포·AI 총평 — 별도 엔드포인트를 두지 않고 리포트에 함께 싣는다 */
  insights?: RoomQuestionInsightDto[];
};

/** @draft 경로는 API 명세서 v2로 확정. 응답 필드는 미확보 — 서술형 답안 목록(W-07 분석 패널) */
export type EssayAnswerDto = {
  answerId: number;
  participantId: number;
  nickname: string;
  content: string;
  aiFeedback?: AiFeedbackDto | null;
  hostReview?: HostReviewDto | null;
};
/** @draft GET /rooms/{roomId}/answers 응답 필드 */
export type EssayAnswersResponse = { answers: EssayAnswerDto[] };
/** @draft PUT /rooms/{roomId}/answers/{answerId}/review 요청 필드 (FR-034) */
export type HostReviewRequest = {
  comment: string;
  improvement?: string | null;
  adjustedScore?: number | null;
};
