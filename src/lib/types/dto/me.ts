import type { HostLevel } from "./common";

export type MyPageSummary = {
  participationCount?: number;
  accuracyPercent?: number;
  avgRank?: number | null;
  trendText?: string | null;
  weakTopics?: string[];
};
export type MyPageOngoing = {
  roomId: number;
  pin: string;
  title: string;
  hostNickname?: string | null;
  progressLabel?: string | null;
};
export type MyPageRoom = {
  roomId: number;
  title: string;
  dateLabel?: string;
  questionCount?: number;
  myScore?: number | null;
  myRank?: number | null;
  hasReport?: boolean;
};
/** GET /users/me/rooms/joined — 요약+진행 중+참여 방 (FR-032·033) */
export type MyPageResponse = {
  summary?: MyPageSummary;
  ongoing?: MyPageOngoing | null;
  rooms?: MyPageRoom[];
  nextCursor?: string | null;
};

export type GradeStats = {
  participationCount?: number;
  avgAccuracyPercent?: number | null;
  roomCount?: number;
  totalStudents?: number;
  avgStars?: number | null;
  ratingCount?: number;
};
export type GradeCriterion = { label?: string; current?: number; target?: number; met?: boolean };
export type GradeNext = {
  level?: HostLevel;
  progressPercent?: number;
  criteria?: GradeCriterion[];
};
/** GET /users/me/grade */
export type GradeResponse = {
  level?: HostLevel;
  achievedAt?: string | null;
  stats?: GradeStats;
  next?: GradeNext | null;
};

export type BadgeType =
  | "FIRST_ROOM"
  | "ROOMS_10"
  | "STUDENTS_100"
  | "RATING_45"
  | "RATINGS_50"
  | "STREAK_30"
  | "FIRST_PAID_ROOM"
  | "AI_SETS_50";
export type BadgeDto = {
  type?: BadgeType;
  earned?: boolean;
  earnedAt?: string | null;
  progressCurrent?: number | null;
  progressTarget?: number | null;
};
/** GET /users/me/badges */
export type BadgesResponse = { items?: BadgeDto[] };

/** GET/PUT /users/me/notification-settings — 3종뿐(마케팅 없음, DESIGN_GAPS C-5) */
export type NotificationSettingsDto = {
  sessionStart?: boolean;
  ratingRequest?: boolean;
  settlementDone?: boolean;
};

/** GET /users/{userId}/profile — 호스트 공개 프로필 */
/**
 * @draft 호스트 공개 프로필이 함께 주는 방 카드. `GET /users/{userId}/profile`이 백엔드 미구현이라
 * 필드가 확정되지 않았다 — 공개 방 목록(`PublicRoomResponse`)과 모양이 다를 수 있다.
 */
export type HostProfileRoom = {
  roomId?: number;
  pin?: string;
  title?: string;
  topic?: string | null;
  status?: string | null;
  participantCount?: number | null;
  scheduledAt?: string | null;
  isPaid?: boolean;
  entryFee?: number | null;
};

export type HostProfileResponse = {
  userId?: number;
  nickname?: string;
  intro?: string | null;
  level?: HostLevel | null;
  avgStars?: number | null;
  ratingCount?: number;
  roomCount?: number;
  totalStudents?: number;
  badges?: BadgeType[];
  rooms?: HostProfileRoom[];
};

export type ReportReason =
  "NICKNAME" | "QUESTION_ERROR" | "PAID_ROOM" | "OPERATION" | "SPAM" | "DIFFICULTY";
/** POST /reports — 게스트 익명 신고 가능 */
export type ReportRequest = {
  targetType: "USER" | "ROOM" | "QUESTION";
  targetId: number;
  reason: ReportReason;
  detail?: string | null;
};
/** POST /guest-records/claim — 가입 후 7일 내, 경과 시 410 RECORD_PURGED */
export type ClaimGuestRecordRequest = { participantId: number };
