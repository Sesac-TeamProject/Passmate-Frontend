import type {
  AdminDashboardResponse,
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
