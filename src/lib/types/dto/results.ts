import type { AnalysisStatus, QuestionType, RoomStatus } from "./common";
import type { RatingAvailability } from "./ratings";

/**
 * 결과·리포트·첨삭·AI 분석 — 백엔드 `report/dto/*.kt`·`feedback/dto/*.kt` 1:1
 * (`contracts/rest-api.md` §2-7).
 */

/**
 * 서술형 AI 분석 결과. **`DONE`일 때만 온다** — 분석 전·중·실패면 필드 자체가 빠진다.
 * 상태는 함께 오는 `analysisStatus`로 판단한다.
 */
export type EssayAnalysisView = {
  keyPoints: string[];
  missingPoints: string[];
  suggestions: string[];
  summary: string;
  completedAt?: string;
};

/** 선생님 첨삭. 조회는 되지만 **저장 API가 아직 없다**(US7에서 `@draft`로 남긴다) */
export type TeacherReviewView = {
  comment?: string;
  /** 보정 점수. 서술형 최종 점수는 이 값이 우선한다 */
  adjustedScore?: number;
  improvement?: string;
  reviewedAt: string;
};

/**
 * GET …/questions/{questionId}/answers/me — 내 답안 한 건과 그 피드백.
 * `remainingFreeAnalysis`는 회원에게만 온다(게스트는 분석을 요청할 수 없다).
 */
export type MyAnswerResponse = {
  roomId: number;
  sessionQuestionId: number;
  questionId: number;
  orderNo: number;
  type: QuestionType;
  content: string;
  points: number;
  /** 내가 낸 답 */
  submitted: string;
  isCorrect?: boolean;
  score: number;
  /** 첨삭 보정이 있으면 반영된 최종 점수 */
  finalScore: number;
  submittedAt: string;
  /** 정답·해설은 문항이 마감된 뒤에만 온다 */
  answer?: string;
  explanation?: string;
  analysisStatus: AnalysisStatus;
  analysis?: EssayAnalysisView;
  teacherReview?: TeacherReviewView;
  /** 이번 달 남은 무료 분석 횟수 */
  remainingFreeAnalysis?: number;
  /** 무료 횟수를 넘겼을 때 1건당 코인 */
  analysisCoinCost: number;
};

/**
 * POST …/answers/me/analysis — **202**로 접수만 하고 결과는 나중에 온다.
 * 완료 알림 이벤트가 없어 화면은 `analysisStatus`가 `PENDING`인 동안 폴링한다.
 * 코인이 모자라면 402 `INSUFFICIENT_COINS`, 게스트는 403 `GUEST_NOT_ALLOWED`.
 */
export type EssayAnalysisRequestResponse = {
  analysisStatus: AnalysisStatus;
  /** 이번에 차감된 코인(무료 횟수 안이면 0) */
  chargedCoins: number;
  remainingFreeAnalysis: number;
  analysisCoinCost: number;
};

/** 결과 화면의 문항 한 줄 — 내 답·정답·점수·피드백을 함께 담는다 */
export type AnswerResultView = {
  sessionQuestionId: number;
  questionId: number;
  orderNo: number;
  type: QuestionType;
  content: string;
  points: number;
  answer?: string;
  explanation?: string;
  /** 안 냈으면 필드가 빠진다 — "미제출"과 "빈 답"은 다르다 */
  submitted?: string;
  isCorrect?: boolean;
  score: number;
  finalScore: number;
  analysisStatus: AnalysisStatus;
  analysis?: EssayAnalysisView;
  teacherReview?: TeacherReviewView;
};

/** GET /rooms/{roomId}/results/me — 게스트도 부를 수 있다. **호스트 이름은 없다**(G-8) */
export type MySessionResultResponse = {
  roomId: number;
  roomTitle: string;
  status: RoomStatus;
  endedAt?: string;
  participantId: number;
  nickname: string;
  avatarId: string;
  /** 게스트로 풀었는가 — 가입 유도 문구를 띄우는 조건 */
  guest: boolean;
  rank: number;
  totalScore: number;
  correctCount: number;
  submitCount: number;
  questionCount: number;
  questions: AnswerResultView[];
  /** 별점 가능 여부·마감. 제출 API는 아직 없다(US12) */
  rating: RatingAvailability;
};

/** GET /rooms/{roomId}/results/participants/{participantId} — 호스트가 학생 한 명을 들여다본다 */
export type ParticipantResultResponse = {
  roomId: number;
  participantId: number;
  nickname: string;
  avatarId: string;
  rank: number;
  totalScore: number;
  correctCount: number;
  submitCount: number;
  questionCount: number;
  questions: AnswerResultView[];
};

export type ResultSummary = {
  participantCount: number;
  questionCount: number;
  /** 0~100 */
  avgCorrectRate: number;
  avgScore: number;
  aiAnalysisCount: number;
};

export type QuestionResultRow = {
  sessionQuestionId: number;
  questionId: number;
  orderNo: number;
  type: QuestionType;
  content: string;
  points: number;
  submitCount: number;
  correctCount: number;
  correctRate: number;
  aiAnalysisCount: number;
};

export type ParticipantResultRow = {
  rank: number;
  participantId: number;
  nickname: string;
  avatarId: string;
  totalScore: number;
  correctCount: number;
  submitCount: number;
};

/** GET /rooms/{roomId}/results (호스트) — **pin·최고점은 없다** */
export type SessionResultsResponse = {
  roomId: number;
  title: string;
  status: RoomStatus;
  startedAt?: string;
  endedAt?: string;
  summary: ResultSummary;
  questions: QuestionResultRow[];
  participants: ParticipantResultRow[];
};

/** GET /rooms/{roomId}/reports/me — 세션 종료 시 서버가 만들어 둔 학습 리포트 */
export type LearningReportResponse = {
  roomId: number;
  roomTitle: string;
  participantId: number;
  nickname: string;
  totalQuestions: number;
  correctCount: number;
  /** 0~100 */
  accuracy: number;
  totalScore: number;
  finalRank: number;
  weakTopics: string[];
  /** 서버가 정답률·취약 주제로 만든 문장들 */
  improvementPoints: string[];
  generatedAt: string;
};

/** 첨삭 대상 답안 한 건 — 문항·학생·AI 분석·기존 첨삭이 한 줄에 다 들어 있다 */
export type ReviewTargetAnswer = {
  answerId: number;
  sessionQuestionId: number;
  questionId: number;
  orderNo: number;
  type: QuestionType;
  questionContent: string;
  points: number;
  /** 모범답안 */
  modelAnswer?: string;
  participantId: number;
  nickname: string;
  avatarId: string;
  submitted: string;
  isCorrect?: boolean;
  score: number;
  finalScore: number;
  submittedAt: string;
  analysisStatus: AnalysisStatus;
  analysis?: EssayAnalysisView;
  reviewed: boolean;
  teacherReview?: TeacherReviewView;
};

/** GET /rooms/{roomId}/answers?questionId&participantId (호스트) */
export type ReviewTargetListResponse = {
  roomId: number;
  totalCount: number;
  reviewedCount: number;
  answers: ReviewTargetAnswer[];
};

/**
 * @draft PUT /rooms/{roomId}/answers/{answerId}/review — **백엔드 미구현**(실서버 404).
 * 필드는 `TeacherReview` 엔티티 기준이라 저장 API가 오면 그대로 맞을 가능성이 높다.
 */
export type HostReviewRequest = {
  comment?: string;
  improvement?: string;
  adjustedScore?: number;
};
