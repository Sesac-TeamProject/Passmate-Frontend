/**
 * REST 계약과 1:1인 DTO (규칙 문서 §2, §5).
 * 단일 진실은 `specs/001-passmate-mvp/contracts/rest-api.md`다.
 *
 * ⚠ 관리자 엔드포인트(/admin/dashboard, /admin/users)는 아직 계약에 없어
 * 피그마 시안(A-01, A-02)에서 역산한 **초안**이다. 계약이 확정되면 이 파일을 계약에 맞춘다.
 */

/* ── 공통 ─────────────────────────────────────────────── */

export type UserRole = "TEACHER" | "STUDENT" | "ADMIN";

/** 오류 응답 본문 (계약 §공통 오류 형식) */
export type ApiErrorBody = { code: string; message: string };

/* ── 인증 ─────────────────────────────────────────────── */

/** POST /auth/refresh 요청 */
export type RefreshTokenRequest = { refreshToken: string };

/** 로그인·refresh 응답 */
export type TokenPair = { accessToken: string; refreshToken: string };

/** GET /me */
export type MeResponse = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  /** 선생님 등급. 선생님이 아니면 null */
  hostLevel: number | null;
};

/* ── A-01 관리자 대시보드: GET /admin/dashboard ───────── */

export type AdminDashboardResponse = {
  kpis: AdminDashboardKpis;
  /** 최근 14일, 날짜 오름차순 */
  dailySessions: DailySessionCount[];
  /** 최신순 */
  recentActivities: AdminActivity[];
  userComposition: UserComposition;
  /** 최근 7일, 횟수 내림차순 */
  popularTopics: PopularTopic[];
  systemStatus: SystemComponentStatus[];
};

export type AdminDashboardKpis = {
  totalUsers: number;
  /** 전일 대비 증감률(%). 음수면 감소 */
  totalUsersDeltaPct: number;
  roomsToday: number;
  roomsTodayDeltaPct: number;
  liveSessions: number;
  monthlyPaymentKrw: number;
  monthlyPaymentDeltaPct: number;
  pendingReports: number;
};

/** date는 YYYY-MM-DD */
export type DailySessionCount = { date: string; count: number };

export type AdminActivityType =
  | "ROOM_CREATED"
  | "REPORT_RECEIVED"
  | "PAYMENT_COMPLETED"
  | "QUESTION_REVIEWED"
  | "SANCTION_LIFTED";

export type AdminActivity = {
  type: AdminActivityType;
  /** ISO 8601 */
  occurredAt: string;
  detail: string;
};

export type UserComposition = { teachers: number; students: number };

export type PopularTopic = { label: string; count: number };

export type SystemHealth = "OK" | "DELAYED" | "NEEDS_ATTENTION";

export type SystemComponentStatus = {
  name: string;
  /** 사람이 읽는 지표 문구. 예: "지연 0.4s" */
  metric: string;
  health: SystemHealth;
};

/* ── A-02 사용자 관리: GET /admin/users?filter= ──────── */

export type AdminUserFilter = "ALL" | "TEACHER" | "STUDENT" | "SANCTIONED";

export type AdminUserStatus = "ACTIVE" | "WARNED" | "SANCTIONED" | "GUEST";

export type AdminUserSummary = {
  id: number;
  name: string;
  /** 게스트는 null */
  email: string | null;
  role: Exclude<UserRole, "ADMIN">;
  /** YYYY-MM-DD. 게스트는 null */
  joinedAt: string | null;
  sessionCount: number;
  /** 선생님 등급. 학생·게스트는 null */
  hostLevel: number | null;
  status: AdminUserStatus;
  warningCount: number;
  /** 제재 중일 때 남은 일수. 아니면 null */
  sanctionDaysLeft: number | null;
};

export type AdminUsersResponse = {
  /** 현재 필터에 해당하는 전체 수 (페이지와 무관) */
  total: number;
  /** 상단 필터 pill에 쓰는 필터별 전체 수 */
  counts: Record<AdminUserFilter, number>;
  items: AdminUserSummary[];
};

/* ── A-03 방 · 문제 관리 ─────────────────────────────── */

/** GET /admin/rooms */
export type AdminRoomsResponse = {
  summary: AdminRoomSummaryCounts;
  items: AdminRoomSummary[];
};

export type AdminRoomSummaryCounts = {
  live: number;
  waiting: number;
  endedToday: number;
};

export type RoomKind = "FREE" | "PAID" | "BRANDED";

export type RoomStatus = "WAITING" | "RUNNING" | "FINISHED";

export type AdminRoomSummary = {
  pin: string;
  title: string;
  /** 브랜디드 방은 "플랫폼 운영" 같은 운영 주체 이름 */
  hostName: string;
  participantCount: number;
  kind: RoomKind;
  /** 유료 방의 참가비(원). 무료·브랜디드는 null */
  entryFeeKrw: number | null;
  status: RoomStatus;
};

/** GET /admin/questions/review-queue — AI 생성 문항 중 신고 누적·정답률 이상 */
export type AdminReviewQueueResponse = {
  items: AdminReviewQuestion[];
};

export type QuestionFormat = "MULTIPLE_CHOICE" | "ESSAY";

export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD";

export type QuestionReviewStatus = "OK" | "TOO_EASY" | "PENDING" | "REJECT_NEEDED";

export type AdminReviewQuestion = {
  /** 표시용 문제 ID. 예: Q-24817 */
  id: string;
  prompt: string;
  format: QuestionFormat;
  difficulty: QuestionDifficulty;
  /** 정답률(%). 서술형처럼 산출 불가면 null */
  correctRatePct: number | null;
  reportCount: number;
  reviewStatus: QuestionReviewStatus;
};
