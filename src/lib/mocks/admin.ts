import type {
  AdminDashboardResponse,
  AdminPaymentsResponse,
  AdminReportsResponse,
  AdminReviewQueueResponse,
  AdminRoomsResponse,
  AdminSanctionsResponse,
  AdminSettlementsResponse,
  AdminUserFilter,
  AdminUserSummary,
  AdminUsersResponse,
} from "@/lib/types/dto";

/**
 * 관리자 화면(A-01·A-02) 목 응답. 값은 피그마 시안(admin/A-01 167:1022, A-02 167:1310)을
 * DTO 모양으로 옮긴 것이다. 백엔드 연동 시 lib/mocks 폴더를 통째로 걷어낸다.
 */

const MINUTE_MS = 60_000;

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * MINUTE_MS).toISOString();
}

export function mockAdminDashboard(): AdminDashboardResponse {
  return {
    kpis: {
      totalUsers: 12480,
      totalUsersDeltaPct: 4.2,
      roomsToday: 316,
      roomsTodayDeltaPct: 8.1,
      liveSessions: 27,
      monthlyPaymentKrw: 4820000,
      monthlyPaymentDeltaPct: 12.6,
      pendingReports: 8,
    },
    dailySessions: [
      { date: "2026-08-11", count: 118 },
      { date: "2026-08-12", count: 142 },
      { date: "2026-08-13", count: 131 },
      { date: "2026-08-14", count: 168 },
      { date: "2026-08-15", count: 186 },
      { date: "2026-08-16", count: 172 },
      { date: "2026-08-17", count: 205 },
      { date: "2026-08-18", count: 231 },
      { date: "2026-08-19", count: 214 },
      { date: "2026-08-20", count: 258 },
      { date: "2026-08-21", count: 276 },
      { date: "2026-08-22", count: 268 },
      { date: "2026-08-23", count: 305 },
      { date: "2026-08-24", count: 338 },
    ],
    recentActivities: [
      { type: "ROOM_CREATED", occurredAt: minutesAgo(2), detail: "박세라 · Spring 면접 8문항" },
      { type: "REPORT_RECEIVED", occurredAt: minutesAgo(11), detail: "부적절 닉네임 · M-03" },
      { type: "PAYMENT_COMPLETED", occurredAt: minutesAgo(25), detail: "₩10,000 · 유료 방 #2841" },
      { type: "QUESTION_REVIEWED", occurredAt: minutesAgo(60), detail: "AI 생성 12문항 승인" },
      { type: "SANCTION_LIFTED", occurredAt: minutesAgo(120), detail: "학생 계정 3건" },
    ],
    userComposition: { teachers: 2140, students: 10340 },
    popularTopics: [
      { label: "Spring · JPA", count: 86 },
      { label: "자료구조", count: 64 },
      { label: "네트워크", count: 51 },
      { label: "정보처리기사", count: 38 },
      { label: "React", count: 29 },
    ],
    systemStatus: [
      { name: "WebSocket 세션 서버", metric: "지연 0.4s", health: "OK" },
      { name: "LLM API", metric: "평균 8.2s", health: "OK" },
      { name: "결제 PG", metric: "응답 3.1s", health: "DELAYED" },
      { name: "Redis 랭킹", metric: "메모리 61%", health: "OK" },
      { name: "스토리지 (음성 힌트)", metric: "용량 92%", health: "NEEDS_ATTENTION" },
    ],
  };
}

const USERS: readonly AdminUserSummary[] = [
  {
    id: 1,
    name: "박세라",
    email: "serah@bootcamp.kr",
    role: "TEACHER",
    joinedAt: "2026-03-12",
    sessionCount: 128,
    hostLevel: 4,
    status: "ACTIVE",
    warningCount: 0,
    sanctionDaysLeft: null,
  },
  {
    id: 2,
    name: "김준영",
    email: "jy.kim@gmail.com",
    role: "STUDENT",
    joinedAt: "2026-05-02",
    sessionCount: 64,
    hostLevel: null,
    status: "ACTIVE",
    warningCount: 0,
    sanctionDaysLeft: null,
  },
  {
    id: 3,
    name: "이도현",
    email: "dohyun@naver.com",
    role: "STUDENT",
    joinedAt: "2026-06-18",
    sessionCount: 12,
    hostLevel: null,
    status: "WARNED",
    warningCount: 2,
    sanctionDaysLeft: null,
  },
  {
    id: 4,
    name: "정민지",
    email: "minji@kakao.com",
    role: "TEACHER",
    joinedAt: "2026-01-08",
    sessionCount: 241,
    hostLevel: 5,
    status: "ACTIVE",
    warningCount: 0,
    sanctionDaysLeft: null,
  },
  {
    id: 5,
    name: "하늘",
    email: null,
    role: "STUDENT",
    joinedAt: null,
    sessionCount: 1,
    hostLevel: null,
    status: "GUEST",
    warningCount: 0,
    sanctionDaysLeft: null,
  },
  {
    id: 6,
    name: "최승혁",
    email: "seung@daum.net",
    role: "STUDENT",
    joinedAt: "2026-07-30",
    sessionCount: 8,
    hostLevel: null,
    status: "SANCTIONED",
    warningCount: 1,
    sanctionDaysLeft: 7,
  },
  {
    id: 7,
    name: "홍희표",
    email: "heepyo@gmail.com",
    role: "TEACHER",
    joinedAt: "2026-02-21",
    sessionCount: 96,
    hostLevel: 3,
    status: "ACTIVE",
    warningCount: 0,
    sanctionDaysLeft: null,
  },
  {
    id: 8,
    name: "전혜림",
    email: "hyerim@gmail.com",
    role: "STUDENT",
    joinedAt: "2026-08-01",
    sessionCount: 3,
    hostLevel: null,
    status: "ACTIVE",
    warningCount: 0,
    sanctionDaysLeft: null,
  },
];

/** 서비스 전체 기준 수. 시안의 필터 pill 숫자라 목 행 수와 다르다. */
const COUNTS: Record<AdminUserFilter, number> = {
  ALL: 12480,
  TEACHER: 2140,
  STUDENT: 10340,
  SANCTIONED: 34,
};

function matchesFilter(user: AdminUserSummary, filter: AdminUserFilter): boolean {
  if (filter === "ALL") return true;
  if (filter === "SANCTIONED") return user.status === "SANCTIONED";
  return user.role === filter;
}

function isAdminUserFilter(value: string | null): value is AdminUserFilter {
  return value !== null && value in COUNTS;
}

export function mockAdminUsers(filterParam: string | null): AdminUsersResponse {
  const filter = isAdminUserFilter(filterParam) ? filterParam : "ALL";
  const items = USERS.filter((u) => matchesFilter(u, filter));

  return { total: COUNTS[filter], counts: COUNTS, items };
}

/* ── A-03 방 · 문제 관리 (시안 admin/A-03 167:1462) ───── */

export function mockAdminRooms(): AdminRoomsResponse {
  return {
    summary: { live: 27, waiting: 9, endedToday: 280 },
    items: [
      {
        pin: "482913",
        title: "8월 4주차 Spring 스터디",
        hostName: "박세라",
        participantCount: 6,
        kind: "FREE",
        entryFeeKrw: null,
        status: "RUNNING",
      },
      {
        pin: "771204",
        title: "정보처리기사 실전 모의",
        hostName: "정민지",
        participantCount: 24,
        kind: "PAID",
        entryFeeKrw: 10000,
        status: "RUNNING",
      },
      {
        pin: "305668",
        title: "네트워크 기초 점검",
        hostName: "홍희표",
        participantCount: 12,
        kind: "FREE",
        entryFeeKrw: null,
        status: "WAITING",
      },
      {
        pin: "119847",
        title: "A사 채용 브랜디드 퀴즈",
        hostName: "플랫폼 운영",
        participantCount: 86,
        kind: "BRANDED",
        entryFeeKrw: null,
        status: "RUNNING",
      },
      {
        pin: "620035",
        title: "자료구조 오답 복습",
        hostName: "박세라",
        participantCount: 9,
        kind: "FREE",
        entryFeeKrw: null,
        status: "FINISHED",
      },
    ],
  };
}

export function mockAdminReviewQueue(): AdminReviewQueueResponse {
  return {
    items: [
      {
        id: "Q-24817",
        prompt: "@Transactional의 기본 전파 속성은?",
        format: "MULTIPLE_CHOICE",
        difficulty: "MEDIUM",
        correctRatePct: 67,
        reportCount: 0,
        reviewStatus: "OK",
      },
      {
        id: "Q-24902",
        prompt: "다음 중 TCP 특징이 아닌 것은?",
        format: "MULTIPLE_CHOICE",
        difficulty: "EASY",
        correctRatePct: 96,
        reportCount: 0,
        reviewStatus: "TOO_EASY",
      },
      {
        id: "Q-25011",
        prompt: "JPA N+1 문제를 설명하시오",
        format: "ESSAY",
        difficulty: "HARD",
        correctRatePct: null,
        reportCount: 1,
        reviewStatus: "PENDING",
      },
      {
        id: "Q-25044",
        prompt: "보기 중복 오류 의심 문항",
        format: "MULTIPLE_CHOICE",
        difficulty: "MEDIUM",
        correctRatePct: 12,
        reportCount: 5,
        reviewStatus: "REJECT_NEEDED",
      },
      {
        id: "Q-25102",
        prompt: "React 렌더링 최적화 방법은?",
        format: "ESSAY",
        difficulty: "MEDIUM",
        correctRatePct: null,
        reportCount: 0,
        reviewStatus: "OK",
      },
    ],
  };
}

/* ── A-04 신고 · 제재 관리 (시안 admin/A-04 167:1697) ──── */

const HOUR_MIN = 60;
const DAY_MIN = 24 * HOUR_MIN;

export function mockAdminReports(): AdminReportsResponse {
  return {
    kpis: {
      pendingReports: 8,
      receivedToday: 14,
      receivedTodayDelta: 3,
      sanctionedAccounts: 34,
      suspended7dCount: 12,
      avgHandlingHours: 2.4,
      avgHandlingDeltaHours: -0.6,
    },
    items: [
      {
        id: "R-1042",
        target: { kind: "STUDENT", label: "최승혁" },
        type: "NICKNAME",
        reason: "욕설이 포함된 닉네임으로 입장",
        reporterName: "박세라",
        receivedAt: minutesAgo(11),
        status: "PENDING",
      },
      {
        id: "R-1041",
        target: { kind: "QUESTION", label: "Q-25044" },
        type: "QUESTION_ERROR",
        reason: "정답 보기가 2개로 보임",
        reporterName: "김준영",
        receivedAt: minutesAgo(38),
        status: "REVIEWING",
      },
      {
        id: "R-1040",
        target: { kind: "ROOM", label: "771204" },
        type: "PAID_ROOM",
        reason: "결제했는데 방이 시작되지 않음",
        reporterName: "이도현",
        receivedAt: minutesAgo(HOUR_MIN),
        status: "PENDING",
      },
      {
        id: "R-1039",
        target: { kind: "TEACHER", label: "정민지" },
        type: "OPERATION",
        reason: "세션 중 부적절한 음성 힌트",
        reporterName: null,
        receivedAt: minutesAgo(3 * HOUR_MIN),
        status: "REVIEWING",
      },
      {
        id: "R-1038",
        target: { kind: "GUEST", label: "하늘" },
        type: "SPAM",
        reason: "서술형 답변에 반복 문자 입력",
        reporterName: "홍희표",
        receivedAt: minutesAgo(5 * HOUR_MIN),
        status: "RESOLVED",
      },
      {
        id: "R-1037",
        target: { kind: "QUESTION", label: "Q-24902" },
        type: "QUESTION_ERROR",
        reason: "난이도 표기가 실제와 다름",
        reporterName: "전혜림",
        receivedAt: minutesAgo(DAY_MIN + 2 * HOUR_MIN),
        status: "RESOLVED",
      },
    ],
  };
}

export function mockAdminSanctions(): AdminSanctionsResponse {
  return {
    items: [
      {
        id: 1,
        accountLabel: "최승혁",
        type: "ACCOUNT_SUSPENDED",
        reason: "반복 신고 3회 누적",
        durationHours: 7 * 24,
        executedAt: "2026-08-22",
        status: "ACTIVE",
      },
      {
        id: 2,
        accountLabel: "익명 게스트 #8821",
        type: "JOIN_RESTRICTED",
        reason: "도배성 답변 제출",
        durationHours: 24,
        executedAt: "2026-08-24",
        status: "ACTIVE",
      },
      {
        id: 3,
        accountLabel: "이도현",
        type: "WARNING",
        reason: "부적절 닉네임 2회",
        durationHours: null,
        executedAt: "2026-08-19",
        status: "WARNING_KEPT",
      },
      {
        id: 4,
        accountLabel: "김태윤",
        type: "AUTHORING_RESTRICTED",
        reason: "저품질 문제 반복 등록",
        durationHours: 14 * 24,
        executedAt: "2026-08-11",
        status: "LIFTED",
      },
    ],
  };
}

/* ── A-05 결제 · 정산 (시안 admin/A-05 167:1956) ──────── */

const PAYOUT_DATE = "2026-09-05";

export function mockAdminPayments(): AdminPaymentsResponse {
  return {
    kpis: {
      monthlyPaymentKrw: 4820000,
      monthlyPaymentDeltaPct: 12.6,
      platformFeeKrw: 964000,
      platformFeeRatePct: 20,
      platformFeeDeltaPct: 12.6,
      teacherPayoutKrw: 3856000,
      payoutDate: PAYOUT_DATE,
      refundKrw: 120000,
      refundCount: 3,
    },
    items: [
      {
        id: "P-2841",
        roomTitle: "정보처리기사 실전 모의",
        teacherName: "정민지",
        studentName: "김준영",
        amountKrw: 10000,
        teacherShareKrw: 8000,
        platformFeeKrw: 2000,
        status: "COMPLETED",
      },
      {
        id: "P-2840",
        roomTitle: "정보처리기사 실전 모의",
        teacherName: "정민지",
        studentName: "이도현",
        amountKrw: 10000,
        teacherShareKrw: 8000,
        platformFeeKrw: 2000,
        status: "COMPLETED",
      },
      {
        id: "P-2839",
        roomTitle: "백엔드 면접 집중반",
        teacherName: "박세라",
        studentName: "최승혁",
        amountKrw: 15000,
        teacherShareKrw: 12000,
        platformFeeKrw: 3000,
        status: "REFUNDED",
      },
      {
        id: "P-2838",
        roomTitle: "백엔드 면접 집중반",
        teacherName: "박세라",
        studentName: "하늘",
        amountKrw: 15000,
        teacherShareKrw: 12000,
        platformFeeKrw: 3000,
        status: "COMPLETED",
      },
      {
        id: "P-2837",
        roomTitle: "네트워크 심화",
        teacherName: "홍희표",
        studentName: "전혜림",
        amountKrw: 8000,
        teacherShareKrw: 6400,
        platformFeeKrw: 1600,
        status: "PENDING",
      },
    ],
  };
}

export function mockAdminSettlements(): AdminSettlementsResponse {
  return {
    payoutDate: PAYOUT_DATE,
    items: [
      {
        teacherId: 4,
        teacherName: "정민지",
        hostLevel: 5,
        paidRoomCount: 12,
        paymentCount: 184,
        payoutKrw: 1472000,
        bankAccount: { bank: "국민", maskedNumber: "***-**-4821" },
        status: "CONFIRMED",
      },
      {
        teacherId: 1,
        teacherName: "박세라",
        hostLevel: 4,
        paidRoomCount: 8,
        paymentCount: 126,
        payoutKrw: 1008000,
        bankAccount: { bank: "신한", maskedNumber: "***-***-2210" },
        status: "CONFIRMED",
      },
      {
        teacherId: 7,
        teacherName: "홍희표",
        hostLevel: 3,
        paidRoomCount: 4,
        paymentCount: 61,
        payoutKrw: 390400,
        bankAccount: null,
        status: "ACCOUNT_MISSING",
      },
    ],
  };
}
