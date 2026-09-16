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

/** 선생님 첨삭. 저장은 `PUT /rooms/{roomId}/answers/{answerId}/review`(upsert) */
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
  /** 한 문항이라도 제출한 참가자 수. 구버전 서버 응답에는 키 자체가 없다 — `?? null` 로 접는다 */
  submittedParticipantCount?: number;
  /** 전 문항을 제출한 참가자 비율(%). 분모 = 참가자 전원 */
  completionRate?: number;
  /**
   * 참가자별 총 소요 시간 평균(ms). 아무도 제출하지 않았으면
   * **키 자체가 빠진다**(서버가 널 필드를 응답에서 뺀다)
   */
  avgElapsedMs?: number | null;
  /** 서술형 답안 수 — "서술형 채점 n/m" 의 분모 */
  essayAnswerCount?: number;
  /** 첨삭이 끝난 서술형 답안 수 */
  essayReviewedCount?: number;
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
  /**
   * 정답률(%). 분모는 참가자 전원. 서술형은 자동 채점이 없어 null 인데,
   * 서버가 널 필드를 응답에서 빼므로 실제로는 **키 자체가 없다** — 읽는 쪽은 `== null` 로 걸러야 한다
   */
  correctRate?: number | null;
  aiAnalysisCount: number;
  /** 문항 단위 선생님 코멘트. 없으면 키가 빠진다 */
  teacherComment?: string | null;
  /** 정답(객관식·OX) 또는 모범답안(서술형). 끝난 방을 호스트만 보는 화면이라 그대로 온다 */
  answer?: string | null;
  /** 해설. 세트에 적지 않았으면 키가 빠진다 */
  explanation?: string | null;
  /** 서술형 채점 분포. 서술형이 아니면 키가 빠진다 */
  essayGrading?: EssayGradingCounts | null;
  /** 서술형 AI 분석 집계. 분석된 답안이 없으면 키가 빠진다 */
  aiInsight?: EssayAiInsight | null;
};

/** 서술형 채점 분포 — 첨삭 점수로 가른다. 첨삭 전은 오답이 아니라 미채점 */
export type EssayGradingCounts = {
  full: number;
  partial: number;
  zero: number;
  unreviewed: number;
};

/** 서술형 AI 분석을 문항 단위로 모은 것 — 빈도순 상위 3 */
export type EssayAiInsight = {
  analyzedCount: number;
  commonKeyPoints: string[];
  commonMissingPoints: string[];
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

/** PUT …/review 응답 — 보정이 반영된 최종 점수를 함께 돌려준다 */
export type TeacherReviewResponse = {
  answerId: number;
  participantId: number;
  /** 보정이 반영된 최종 점수. 보정을 지우면 채점기가 낸 잠정 점수로 돌아간다 */
  finalScore: number;
  review: TeacherReviewView;
};

/** PUT /rooms/{roomId}/questions/{questionId}/comment 응답 */
export type QuestionCommentResponse = {
  roomId: number;
  questionId: number;
  comment: string;
  updatedAt?: string;
};

export type HostReviewRequest = {
  comment?: string;
  improvement?: string;
  adjustedScore?: number;
};
