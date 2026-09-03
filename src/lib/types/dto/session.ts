import type { QuestionType, RoomStatus } from "./common";

/**
 * 실시간 세션 — 백엔드 `session/dto/*.kt` 1:1 (`contracts/rest-api.md` §2-6, `ws-events.md`).
 *
 * 제어는 전부 REST고(start·next·current/end·end·lock), 화면 전환은 STOMP 이벤트가 만든다.
 * 클라이언트 → 서버 메시지는 **없다**(서버에 `@MessageMapping`이 없다).
 */

/**
 * 문항이 열릴 때 오는 값 — `QUESTION_STARTED` 페이로드이자 스냅샷의 현재 문항.
 * **정답이 들어 있지 않다.** 정답은 문항이 마감된 뒤(`QUESTION_ENDED`)에야 공개된다.
 */
export type QuestionStartedPayload = {
  /** 세션에 복사된 문항의 id. 집계·결과가 이 값을 쓴다 */
  sessionQuestionId: number;
  /** 원본 세트 문항의 id. **답안 제출 경로에 들어가는 것은 이쪽이다** */
  questionId: number;
  orderNo: number;
  totalCount: number;
  type: QuestionType;
  content: string;
  choices?: string[];
  points: number;
  timeLimitSec: number;
  /** 마감 시각(UTC naive). 남은 시간은 `remainingMs(endsAt)`로 파생한다 */
  endsAt: string;
};

/** 문항이 마감될 때 오는 값 — 여기서 처음 정답이 공개된다 */
export type QuestionEndedPayload = {
  sessionQuestionId: number;
  questionId: number;
  orderNo: number;
  answer?: string;
  explanation?: string;
  submitCount: number;
  correctCount: number;
  /** 0~100 */
  correctRate: number;
  /** 키는 **제출된 보기 원문**(MCQ) 또는 "O"/"X". 서술형은 빈 객체 */
  distribution: Record<string, number>;
};

/** 랭킹 한 줄. `avatarId`는 12종 밖의 값이 올 수 있어 화면에서 `toAvatarKey`로 접는다 */
export type RankingEntry = {
  rank: number;
  participantId: number;
  nickname: string;
  avatarId: string;
  totalScore: number;
};

/** 호스트 화면의 제출 현황 — `SUBMISSION_UPDATED` 페이로드이자 `GET …/current/submissions` 응답 */
export type SubmissionStatusPayload = {
  sessionQuestionId: number;
  submitCount: number;
  participantCount: number;
  correctCount: number;
  correctRate: number;
  distribution: Record<string, number>;
};

/** `SCREEN_LOCKED` 페이로드 */
export type ScreenLockPayload = { locked: boolean };

/**
 * GET /rooms/{roomId}/session — 재접속 스냅샷.
 * **WAITING이어도 200이다**(404가 아니다). 서버 시각(`ts`)·내 점수·내 답안 목록은 들어 있지 않다.
 */
export type SessionSnapshotResponse = {
  roomId: number;
  status: RoomStatus;
  /** 0이면 아직 시작 전 */
  currentQuestionNo: number;
  totalCount: number;
  screenLocked: boolean;
  currentQuestion?: QuestionStartedPayload;
  /** 이 문항에 내가 이미 답을 냈는가 */
  submitted: boolean;
  ranking: RankingEntry[];
};

/** POST …/questions/{questionId}/answers — MCQ는 보기 **원문**, OX는 "O"|"X", 서술형은 본문 */
export type AnswerSubmitRequest = { submitted: string };

/**
 * 답안 제출 응답. 총점·순위는 없다 — 랭킹은 `RANKING_UPDATED`가 알려준다.
 * 서술형은 자동 채점하지 않아 `isCorrect`가 비어 있다.
 */
export type AnswerResponse = {
  answerId: number;
  sessionQuestionId: number;
  isCorrect?: boolean;
  baseScore: number;
  /** 남은 시간 비율 × 배점 × 0.5 (최대 +50%) */
  speedBonus: number;
  score: number;
  submittedAt: string;
};

/** GET …/session/questions/{questionId}/result — 마감된 문항만 */
export type QuestionResultResponse = {
  sessionQuestionId: number;
  questionId: number;
  orderNo: number;
  answer?: string;
  explanation?: string;
  submitCount: number;
  correctCount: number;
  correctRate: number;
  distribution: Record<string, number>;
  ranking: RankingEntry[];
};

/** PUT /rooms/{roomId}/session/lock */
export type ScreenLockRequest = { locked: boolean };
export type ScreenLockResponse = { roomId: number; screenLocked: boolean };

/**
 * 음성 힌트(PTT) — 백엔드 `voicehint` 패키지 1:1.
 * 업로드는 파트 이름이 `file`이고 `durationMs`는 쿼리다(`api/sessions.ts` 주석 참고).
 */
/** 음성 힌트 한 개 — 호스트가 문항에 붙인 클립 */
export type VoiceHintEntry = {
  hintId: number;
  sessionQuestionId: number;
  questionId: number;
  /** 몇 번째 문항의 힌트인지 */
  orderNo: number;
  audioUrl: string;
  durationMs?: number;
  publishedAt: string;
};

/** GET /rooms/{roomId}/session/hints */
export type VoiceHintsResponse = {
  roomId: number;
  totalCount: number;
  hints: VoiceHintEntry[];
};
