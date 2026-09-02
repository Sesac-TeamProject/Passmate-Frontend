import type { HostLevel, PageResponse, RoomStatus } from "./common";

/** 참여한 방 한 줄 — 백엔드 `report/dto/JoinedRoomResponses.kt` 1:1 */
export type JoinedRoom = {
  roomId: number;
  title: string;
  /** 방을 연 선생님 닉네임 */
  hostNickname: string;
  status: RoomStatus;
  startedAt?: string;
  endedAt?: string;
  questionCount: number;
  fee?: number;
  /** 내 성적. 아직 안 풀었거나 채점 전이면 빠진다 */
  myScore?: number;
  myRank?: number;
  /** 0~100 */
  myAccuracy?: number;
  /** 학습 리포트가 만들어졌는가 — false면 리포트 링크를 걸지 않는다 */
  hasReport: boolean;
};

/** 참여한 방 목록 위의 요약 지표 */
export type JoinedSummary = {
  completedSessionCount: number;
  averageAccuracy: number;
  averageRank: number;
  weakTopics: string[];
};

/** GET /users/me/rooms/joined?page&size — 요약 + **오프셋 페이지** */
export type JoinedRoomsResponse = {
  summary: JoinedSummary;
  rooms: PageResponse<JoinedRoom>;
};

/** 누적 리포트의 추이 한 점 — 세션 하나 */
export type SessionTrendPoint = {
  roomId: number;
  roomTitle: string;
  totalScore: number;
  accuracy: number;
  finalRank: number;
  playedAt: string;
};

/** GET /users/me/report — 누적 학습 리포트 */
export type CumulativeReportResponse = {
  joinedRoomCount: number;
  completedSessionCount: number;
  averageAccuracy: number;
  averageRank: number;
  /** 지난주 대비 정답률 변화(%p). 비교할 지난주가 없으면 빠진다 */
  accuracyChangeFromLastWeek?: number;
  trend: SessionTrendPoint[];
  weakTopics: string[];
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
/**
 * @draft POST /guest-records/claim — **백엔드 미구현**(실서버 404).
 *
 * 연동 키는 입장할 때 받은 `guestToken`이다(ERD `participant.guest_token`) — `participantId`가
 * 아니다. 웹은 그 값을 방별로 7일간 들고 있다(`lib/guest-token-storage`).
 */
export type ClaimGuestRecordRequest = { guestToken: string };
