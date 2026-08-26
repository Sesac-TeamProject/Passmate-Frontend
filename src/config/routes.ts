export type Role = "public" | "student" | "teacher" | "admin";

export type RouteMeta = {
  /** app 폴더 기준 URL 패턴. 예: /play/[code] */
  path: string;
  /** 링크·검증용 샘플 URL. 동적 세그먼트를 채운 값 */
  sample: string;
  /** 화면 제목 (기획서 §7) */
  title: string;
  /** 화면 설명 (기획서 §7) */
  description: string;
  role: Role;
};

export const ROLE_LABEL: Record<Role, string> = {
  public: "공통",
  student: "학생",
  teacher: "선생님",
  admin: "관리자",
};

export const ROUTES: readonly RouteMeta[] = [
  // 공통
  {
    path: "/login",
    sample: "/login",
    title: "로그인·프로필",
    description: "OAuth 로그인 (선생님·학생 공용)",
    role: "public",
  },
  {
    path: "/rooms",
    sample: "/rooms",
    title: "공개 방 목록",
    description: "공개 설정된 방 탐색·입장, Lv.4+ 선생님 방 상단 노출",
    role: "public",
  },
  {
    path: "/me",
    sample: "/me",
    title: "마이페이지 (학습 기록)",
    description: "참여 세션 목록, 문제별 결과·피드백, 누적 리포트 — 회원 전용",
    role: "public",
  },
  // 학생
  {
    path: "/join",
    sample: "/join",
    title: "입장",
    description: "PIN 입력·QR 스캔, 닉네임 설정",
    role: "student",
  },
  {
    path: "/play/[code]",
    sample: "/play/DEMO01",
    title: "풀이",
    description: "문항·선택지·서술 입력, 타이머, 제출, 음성 힌트 수신 배너·재생",
    role: "student",
  },
  {
    path: "/result/[sessionId]",
    sample: "/result/1",
    title: "결과·리포트",
    description: "점수·랭킹, 문제별 피드백, 취약점 리포트, 세션 별점·코멘트, 게스트 가입 유도",
    role: "student",
  },
  {
    path: "/pay/[code]",
    sample: "/pay/DEMO01",
    title: "유료 방 결제",
    description: "참가비 확인·결제·실패 안내 (회원 전용, 게스트는 로그인 유도)",
    role: "student",
  },
  // 선생님
  {
    path: "/teacher/dashboard",
    sample: "/teacher/dashboard",
    title: "대시보드",
    description: "내 방·문제 세트·지난 세션 목록",
    role: "teacher",
  },
  {
    path: "/teacher/sets",
    sample: "/teacher/sets",
    title: "문제 세트",
    description: "내 문제 세트 목록·재활용, 우측 패널 미리보기",
    role: "teacher",
  },
  {
    path: "/teacher/rooms/new",
    sample: "/teacher/rooms/new",
    title: "방 설정",
    description: "방 이름·문제 세트 선택, 6자리 PIN 발급 (방 만들기 1/3)",
    role: "teacher",
  },
  {
    path: "/teacher/editor",
    sample: "/teacher/editor",
    title: "문제 에디터",
    description: "AI 생성 조건 입력, 생성 결과 검토·수정, 직접 출제",
    role: "teacher",
  },
  {
    path: "/teacher/rooms/[code]/lobby",
    sample: "/teacher/rooms/DEMO01/lobby",
    title: "대기실",
    description: "PIN/QR 표시, 학생 목록 (프로젝터 투사 가정)",
    role: "teacher",
  },
  {
    path: "/teacher/rooms/[code]/live",
    sample: "/teacher/rooms/DEMO01/live",
    title: "진행 화면",
    description: "문항·타이머·제출 현황·랭킹, PTT 음성 힌트 버튼",
    role: "teacher",
  },
  {
    path: "/teacher/rooms/[code]/result",
    sample: "/teacher/rooms/DEMO01/result",
    title: "문항 결과",
    description: "문항별 정답·선택 분포·랭킹 변동 (프로젝터 투사 가정)",
    role: "teacher",
  },
  {
    path: "/teacher/sessions/[sessionId]/review",
    sample: "/teacher/sessions/1/review",
    title: "첨삭·리포트",
    description: "답변별 AI 분석 확인, 코멘트·점수 입력, 통계",
    role: "teacher",
  },
  {
    path: "/teacher/revenue",
    sample: "/teacher/revenue",
    title: "수익·정산 내역",
    description: "유료 방 수익 적립·정산 내역, 내 등급·평가 현황 (Lv.3+)",
    role: "teacher",
  },
  // 관리자
  {
    path: "/admin/settlements",
    sample: "/admin/settlements",
    title: "정산 관리",
    description: "정산 대기·완료·보류 관리",
    role: "admin",
  },
  {
    path: "/admin/refunds",
    sample: "/admin/refunds",
    title: "환불 처리",
    description: "결제 환불 요청 처리",
    role: "admin",
  },
  {
    path: "/admin/branded",
    sample: "/admin/branded",
    title: "브랜디드 퀴즈",
    description: "기업 브랜디드 퀴즈 등록·노출 관리",
    role: "admin",
  },
];

export const REDIRECTS: readonly { from: string; to: string }[] = [
  { from: "/teacher", to: "/teacher/dashboard" },
  { from: "/admin", to: "/admin/settlements" },
];

/** 선생님·관리자 사이드바에 노출할 항목. 순서대로 그린다. label을 생략하면 라우트 title을 쓴다. */
export const SIDEBAR_NAV: Record<"teacher" | "admin", readonly { path: string; label?: string }[]> =
  {
    teacher: [
      { path: "/teacher/dashboard" },
      { path: "/teacher/sets" },
      { path: "/teacher/sessions/[sessionId]/review", label: "지난 세션" },
      { path: "/teacher/revenue" },
      { path: "/me", label: "마이페이지" },
    ],
    admin: [{ path: "/admin/settlements" }, { path: "/admin/refunds" }, { path: "/admin/branded" }],
  };

export function getRoute(path: string): RouteMeta {
  const route = ROUTES.find((r) => r.path === path);
  if (!route) {
    throw new Error(`routes.ts에 등록되지 않은 경로: ${path}`);
  }
  return route;
}

export function routesByRole(role: Role): RouteMeta[] {
  return ROUTES.filter((r) => r.role === role);
}
