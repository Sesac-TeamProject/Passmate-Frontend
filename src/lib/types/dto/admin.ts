import type { UserRole } from "./auth";

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

/* ── A-04 신고 · 제재 관리 ───────────────────────────── */

/** GET /admin/reports */
export type AdminReportsResponse = {
  kpis: AdminReportKpis;
  /** 최근 접수순 */
  items: AdminReport[];
};

export type AdminReportKpis = {
  pendingReports: number;
  receivedToday: number;
  /** 전일 대비 접수 증감(건). 음수면 감소 */
  receivedTodayDelta: number;
  sanctionedAccounts: number;
  /** 제재 중 계정 가운데 7일 정지 수 */
  suspended7dCount: number;
  avgHandlingHours: number;
  /** 전주 대비 평균 처리 시간 증감(시간). 음수면 빨라짐 */
  avgHandlingDeltaHours: number;
};

export type ReportTargetKind = "STUDENT" | "TEACHER" | "GUEST" | "QUESTION" | "ROOM";

export type ReportType = "NICKNAME" | "QUESTION_ERROR" | "PAID_ROOM" | "OPERATION" | "SPAM";

export type ReportStatus = "PENDING" | "REVIEWING" | "RESOLVED";

export type AdminReport = {
  /** 표시용 신고 ID. 예: R-1042 */
  id: string;
  target: { kind: ReportTargetKind; label: string };
  type: ReportType;
  reason: string;
  /** 익명 신고는 null */
  reporterName: string | null;
  /** ISO 8601 */
  receivedAt: string;
  status: ReportStatus;
};

/** GET /admin/sanctions?days=30 */
export type AdminSanctionsResponse = {
  items: AdminSanction[];
};

export type SanctionType =
  "ACCOUNT_SUSPENDED" | "JOIN_RESTRICTED" | "WARNING" | "AUTHORING_RESTRICTED";

export type SanctionStatus = "ACTIVE" | "WARNING_KEPT" | "LIFTED";

export type AdminSanction = {
  id: number;
  /** 계정 표시명. 게스트는 "익명 게스트 #8821" 형태 */
  accountLabel: string;
  type: SanctionType;
  reason: string;
  /** 제재 기간(시간). 경고처럼 기간이 없으면 null */
  durationHours: number | null;
  /** YYYY-MM-DD */
  executedAt: string;
  status: SanctionStatus;
};

/* ── A-05 결제 · 정산 ────────────────────────────────── */

/** GET /admin/payments */
export type AdminPaymentsResponse = {
  kpis: AdminPaymentKpis;
  /** 최근 결제순 */
  items: AdminPayment[];
};

export type AdminPaymentKpis = {
  monthlyPaymentKrw: number;
  /** 전월 대비 증감률(%) */
  monthlyPaymentDeltaPct: number;
  platformFeeKrw: number;
  /** 플랫폼 수수료율(%). 예: 20 */
  platformFeeRatePct: number;
  platformFeeDeltaPct: number;
  /** 이번 정산일에 지급 예정인 선생님 정산 합계 */
  teacherPayoutKrw: number;
  /** 정산 지급일 YYYY-MM-DD */
  payoutDate: string;
  refundKrw: number;
  refundCount: number;
};

export type PaymentStatus = "COMPLETED" | "REFUNDED" | "PENDING";

export type AdminPayment = {
  /** 표시용 결제 ID. 예: P-2841 */
  id: string;
  roomTitle: string;
  teacherName: string;
  studentName: string;
  amountKrw: number;
  teacherShareKrw: number;
  platformFeeKrw: number;
  status: PaymentStatus;
};

/** GET /admin/settlements/pending — 다음 정산일 지급 대기 선생님 */
export type AdminSettlementsResponse = {
  /** 일괄 지급일 YYYY-MM-DD */
  payoutDate: string;
  items: AdminSettlement[];
};

export type SettlementStatus = "CONFIRMED" | "ACCOUNT_MISSING";

export type AdminSettlement = {
  teacherId: number;
  teacherName: string;
  hostLevel: number;
  paidRoomCount: number;
  paymentCount: number;
  payoutKrw: number;
  /** 미등록이면 null. 계좌번호는 서버가 마스킹해서 준다 */
  bankAccount: { bank: string; maskedNumber: string } | null;
  status: SettlementStatus;
};

/* ── A-06 광고 · 브랜디드 퀴즈 ──────────────────────── */

/** GET /admin/ad-campaigns */
export type AdminAdCampaignsResponse = {
  kpis: AdminAdKpis;
  items: AdCampaign[];
};

export type AdminAdKpis = {
  activeCampaigns: number;
  /** 이번 주 신규 캠페인 수 */
  newCampaigns: number;
  monthlyAdRevenueKrw: number;
  monthlyAdRevenueDeltaPct: number;
  /** 학생 배분액 합계 */
  studentShareKrw: number;
  /** 학생 배분율(%). 예: 30 */
  studentShareRatePct: number;
  /** 배분 지급일 YYYY-MM-DD */
  payoutDate: string;
  brandedQuizCount: number;
  /** 브랜디드 퀴즈 계약액 합계 */
  brandedContractKrw: number;
};

export type AdPlacement = "RESULT_BOTTOM" | "LOBBY_BANNER" | "REPORT_BOTTOM" | "HOME_CARD";

export type AdCampaignStatus = "RUNNING" | "PENDING_REVIEW" | "ENDED";

export type AdCampaign = {
  id: number;
  name: string;
  advertiser: string;
  placement: AdPlacement;
  /** 집행 전이면 null */
  impressions: number | null;
  /** 클릭률(%). 집행 전이면 null */
  clickRatePct: number | null;
  /** YYYY-MM-DD */
  startsOn: string;
  /** YYYY-MM-DD */
  endsOn: string;
  status: AdCampaignStatus;
};

/** GET /admin/branded-quizzes */
export type AdminBrandedQuizzesResponse = {
  items: BrandedQuiz[];
};

export type BrandedQuizPurpose = "RECRUITING" | "BRANDING" | "TRAINING";

export type BrandedQuizStatus = "LIVE" | "IN_PRODUCTION" | "ENDED";

export type BrandedQuiz = {
  id: number;
  name: string;
  company: string;
  purpose: BrandedQuizPurpose;
  /** 운영 전이면 null */
  participantCount: number | null;
  /** 완주율(%). 운영 전이면 null */
  completionRatePct: number | null;
  contractKrw: number;
  status: BrandedQuizStatus;
};
