import type { AvatarKey } from "./common";
import type { QuestionType, RoomState } from "./common";

/** 진행 문항 — 정답은 절대 포함하지 않는다 */
export type SnapshotQuestion = {
  questionId: number;
  questionNo: number;
  type?: QuestionType | null;
  body: string;
  choices?: string[] | null;
  points?: number;
  timeLimitSec?: number;
  /** ISO-8601. 남은 시간 = endsAt − 서버 ts */
  endsAt: string;
  isClosed?: boolean;
};
export type SnapshotAnswer = {
  questionId: number;
  correct?: boolean | null;
  earnedScore?: number | null;
  isProvisional?: boolean;
};
export type RankingEntry = {
  rank: number;
  participantId: number;
  nickname: string;
  avatarId?: AvatarKey | null;
  total: number;
  /** @draft 맞힌 문항 수 — 최종 결과 전체 순위표의 "정답" 열 (시안 788:8959). 미제출이면 null */
  correctCount?: number | null;
};

/** GET /rooms/{roomId}/session — 재접속 스냅샷. 404 = 세션 미시작(WAITING) */
export type SessionSnapshotResponse = {
  status?: RoomState | null;
  /** 서버 시각. 이 ts 이전 STOMP 프레임은 폐기 */
  ts: string;
  questionCount?: number | null;
  currentQuestion?: SnapshotQuestion | null;
  myAnswers?: SnapshotAnswer[];
  totalScore?: number | null;
  rank?: number | null;
  ranking?: RankingEntry[];
  isLocked?: boolean;
};

export type SubmissionChoice = { label?: string; count?: number };
export type SubmissionParticipant = {
  participantId?: number;
  nickname?: string;
  avatarId?: AvatarKey | null;
  submitted?: boolean;
};
/** GET /rooms/{roomId}/session/current/submissions (호스트) */
export type SubmissionsResponse = {
  questionNo?: number;
  submittedCount?: number;
  totalCount?: number;
  accuracyPercent?: number | null;
  choices?: SubmissionChoice[] | null;
  participants?: SubmissionParticipant[];
};

/** POST /rooms/{roomId}/session/start — false면 이 세션 서술형 AI 분석 SKIPPED(FR-062) */
export type StartSessionResponse = { aiAnalysisEnabled?: boolean };
/** PUT /rooms/{roomId}/session/lock */
export type ScreenLockRequest = { locked: boolean };

/** 객관식: 보기 원문, OX: "O"|"X", 서술형: 자유 텍스트 */
export type SubmitAnswerRequest = { content: string };
export type SubmitAnswerResponse = {
  correct?: boolean | null;
  baseScore?: number;
  speedBonus?: number;
  earnedScore?: number;
  totalScore?: number;
  rank?: number | null;
  rankDelta?: number | null;
  isProvisional?: boolean;
};

export type VoiceHintEntry = {
  hintId: number;
  questionNo: number;
  clipUrl: string;
  durationMs?: number;
};
/** GET /rooms/{roomId}/session/hints — 다시 듣기·재접속 복구 */
export type VoiceHintsResponse = { hints?: VoiceHintEntry[] };
