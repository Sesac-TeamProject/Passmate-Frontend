import type { PageResponse, RoomStatus } from "./common";
import type { PublicRoomResponse } from "./rooms";

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

/**
 * 승급 조건 한 줄의 진행도.
 * **기준은 서버가 계산해서 내려준다** — 화면이 등급 기준을 따로 들고 있지 않게 하려는 설계다
 * (백엔드 `HostGradeResponses.kt`). 기준이 바뀌어도 프런트를 고칠 필요가 없다.
 */
export type GradeRequirement = {
  /** `ROOMS_HOSTED` · `TOTAL_STUDENTS` · `AVG_RATING` */
  type: string;
  label: string;
  current: number;
  target: number;
  met: boolean;
};

/** Lv.4~5 유지 조건 충족 현황. Lv.1~3은 유지 조건이 없어 응답에서 빠진다 */
export type GradeMaintenance = {
  /** 유지 판정 기간(일) */
  windowDays: number;
  sessionsInWindow: number;
  requiredSessions: number;
  avgRating?: number;
  requiredAvgRating?: number;
  met: boolean;
  nextEvaluationAt?: string;
};

/** GET /users/me/grade — 내 등급·명성 */
export type GradeResponse = {
  level: number;
  /** 등급 이름("새싹"). 서버 문구를 그대로 쓴다 */
  levelName: string;
  levelAchievedAt?: string;
  /** 방 운영 횟수 — 시작해서 종료까지 간 방만 센다 */
  roomsHosted: number;
  totalStudents: number;
  /** 평균 별점. 받은 평가가 없으면 응답에서 빠진다 */
  avgRating?: number;
  ratingCount: number;
  /** 다음 등급. 최고 등급이면 빠진다 */
  nextLevel?: number;
  nextLevelName?: string;
  /** 다음 등급 조건별 진행도. 최고 등급이면 빈 배열 */
  nextRequirements: GradeRequirement[];
  /** 다음 등급까지 종합 진행률 — **0~1**이다. 화면은 %로 바꿔 그린다 */
  nextLevelProgress?: number;
  /** 평가 표본이 모자라 승급이 보류된 상태인지(FR-046) */
  ratingSamplePending: boolean;
  maintenance?: GradeMaintenance;
  /** 지금 등급까지 열린 기능 문구 */
  unlocked: string[];
  lastEvaluatedAt?: string;
};

/** 뱃지 코드 8종 — 백엔드 시드(`V3__badge_seed.sql`)가 원본이다 */
export type BadgeType =
  | "FIRST_ROOM"
  | "ROOMS_10"
  | "STUDENTS_100"
  | "RATING_45"
  | "RATINGS_50"
  | "ACTIVE_30D"
  | "FIRST_PAID_ROOM"
  | "AI_SETS_50";

/** 뱃지 한 칸 */
export type BadgeResponse = {
  code: BadgeType;
  name: string;
  description?: string;
  iconUrl?: string;
  achieved: boolean;
  achievedAt?: string;
  /** 현재 진행값 */
  progress: number;
  /** 달성 목표치. 조건이 없는 뱃지는 빠진다 */
  target?: number;
};

/** GET /users/me/badges — 획득한 것 먼저, 그 안에서는 최근 획득 순 */
export type BadgesResponse = {
  achievedCount: number;
  totalCount: number;
  badges: BadgeResponse[];
};

/**
 * GET·PUT /users/me/notification-settings 응답 — 3종뿐(마케팅 없음, DESIGN_GAPS C-5).
 * **셋 다 반드시 온다** — 서버가 현재 설정을 통째로 돌려주기 때문에 optional이 아니다.
 */
export type NotificationSettingsDto = {
  sessionStart: boolean;
  ratingRequest: boolean;
  settlementDone: boolean;
};

/**
 * PUT /users/me/notification-settings 요청 — **바꿀 것만 보낸다**(부분 수정).
 * 응답 타입과 같게 두면 토글 하나 바꿀 때마다 나머지 둘을 실어 보내야 한다.
 */
export type NotificationSettingsUpdate = Partial<NotificationSettingsDto>;

/**
 * GET /users/{userId}/profile — 선생님 공개 프로필.
 * 열어 둔 방은 공개 방 카드와 같은 모양이라 **PIN이 없다**(DESIGN_GAPS N-1) —
 * 카드에서 방으로 바로 넣지 못하고 `/join`으로 보낸다.
 */
export type HostProfileResponse = {
  userId: number;
  nickname: string;
  profileImageUrl?: string;
  defaultAvatarId?: string;
  /** 활동 시작 시각 — 가입일 */
  activeSince?: string;
  level: number;
  levelName: string;
  avgRating?: number;
  ratingCount: number;
  roomsHosted: number;
  totalStudents: number;
  badgeCount: number;
  /** 획득한 뱃지만. 못 딴 것은 남에게 보이지 않는다 */
  badges: BadgeResponse[];
  /** 지금 열어 둔 공개 방(운영 중·예정). 비공개 방은 빠진다 */
  openRooms: PublicRoomResponse[];
};

/** 신고 종류 — 서버 필드 이름은 `type`이다(`reason`은 자유 서술) */
export type ReportType =
  "NICKNAME" | "QUESTION_ERROR" | "PAID_ROOM" | "OPERATION" | "SPAM" | "DIFFICULTY";

export type ReportTargetType = "USER" | "PARTICIPANT" | "QUESTION" | "ROOM";

/** POST /reports — 게스트도 낼 수 있다 */
export type ReportRequest = {
  targetType: ReportTargetType;
  targetId: number;
  type: ReportType;
  /** 자유 서술. 화면이 고른 항목 문구를 그대로 넣는다 */
  reason: string;
};

export type ReportStatus = "OPEN" | "REVIEWING" | "RESOLVED";

/** POST /reports 응답 — 접수된 신고 한 건 */
export type ReportResponse = {
  id: number;
  targetType: ReportTargetType;
  targetId: number;
  type: ReportType;
  reason: string;
  status: ReportStatus;
  createdAt?: string;
};

/**
 * POST /guest-records/claim — 가입 후 게스트 기록을 계정으로 옮긴다.
 * 연동 키는 입장할 때 받은 `guestToken`이다(`participantId`가 아니다) —
 * 웹은 그 값을 방별로 7일간 들고 있다(`lib/guest-token-storage`).
 */
export type GuestClaimRequest = { guestToken: string };

/** 옮겨진 기록 한 건 — 화면이 "OO 방 기록을 가져왔어요"로 알린다 */
export type GuestClaimResponse = {
  roomId: number;
  roomTitle: string;
  participantId: number;
  nickname: string;
  totalScore: number;
  finalRank?: number;
  claimedAt?: string;
};
