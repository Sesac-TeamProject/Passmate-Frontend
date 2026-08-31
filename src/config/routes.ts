/**
 * 화면 구역. 권한·신분이 아니다 — 계정에 역할이 없고 한 회원이 방을 열기도(host) 들어가기도(participant) 한다.
 * public: 로그인 없이 · participant: 방 참여(회원·게스트) · host: 방 개설·운영 · member: 회원 전용 · admin: 관리자
 */
export type Area = "public" | "participant" | "host" | "member" | "admin";

export type RouteMeta = {
  /** app 폴더 기준 URL 패턴. 예: /play/[code] */
  path: string;
  /** 링크·검증용 샘플 URL. 동적 세그먼트를 채운 값 */
  sample: string;
  /** 화면 제목 (기획서 §7) */
  title: string;
  /** 화면 설명 (기획서 §7) */
  description: string;
  area: Area;
  /** 사이드바에서 활성으로 표시할 내비 항목의 path. 자기 경로가 내비에 없는 화면만 지정 (예: /pay/[code] → /home) */
  nav?: string;
};

export const AREA_LABEL: Record<Area, string> = {
  public: "공통",
  participant: "참여 (학생·게스트)",
  host: "개설·운영 (호스트)",
  member: "회원",
  admin: "관리자",
};

export const ROUTES: readonly RouteMeta[] = [
  // 공통
  {
    path: "/",
    sample: "/",
    title: "랜딩",
    description:
      "서비스 소개 (L-01) — 무료로 방 열기·PIN 입장, 사용 방법 3단계, 기능 3종, 후기, FAQ",
    area: "public",
  },
  {
    path: "/login",
    sample: "/login",
    title: "로그인",
    description: "이메일·Google 로그인, 회원가입·비밀번호 찾기, PIN 게스트 입장 링크",
    area: "public",
  },
  {
    path: "/auth/callback",
    sample: "/auth/callback",
    title: "로그인 처리",
    description: "소셜 로그인 콜백 — 토큰 수신 후 원래 가려던 화면으로",
    area: "public",
  },
  {
    path: "/hosts/[userId]",
    sample: "/hosts/42",
    title: "선생님 프로필",
    description: "공개 프로필 — 평점·운영 실적·뱃지·운영 중인 방 (인기 방 카드에서 이름 탭)",
    area: "public",
  },
  {
    path: "/rooms",
    sample: "/rooms",
    title: "공개 방 목록",
    description: "공개 설정된 방 탐색·입장, Lv.4+ 선생님 방 상단 노출",
    area: "public",
  },
  {
    path: "/home",
    sample: "/home",
    title: "홈",
    description: "PIN 입장, 인기 방 캐러셀, 최근 참여한 방·내가 만든 방 요약, + 새 방 만들기 모달",
    area: "member",
  },
  {
    path: "/me",
    sample: "/me",
    title: "마이페이지",
    description:
      "내 정보 관리 — 계정 · 코인 · 결제 · 정산 계좌 · 알림 · 로그아웃 · 탈퇴 (회원 전용)",
    area: "member",
  },
  {
    path: "/me/joined",
    sample: "/me/joined",
    title: "참여한 방",
    description: "참여 기록·통계·보완할 주제, 진행 중인 방 다시 들어가기, 세션별 리포트",
    area: "member",
  },
  {
    path: "/me/settlement",
    sample: "/me/settlement",
    title: "정산",
    description: "유료 방 참가비 정산 내역·지급 상태·정산 계좌 (Lv.3+ 유료 방 개설자)",
    area: "member",
  },
  {
    path: "/me/account",
    sample: "/me/account",
    title: "계정 정보 변경",
    description: "프로필 캐릭터·닉네임 변경 (이메일은 로그인 ID라 변경 불가)",
    area: "member",
  },
  {
    path: "/me/password",
    sample: "/me/password",
    title: "비밀번호 변경",
    description: "현재 비밀번호 확인 후 새 비밀번호 설정",
    area: "member",
  },
  {
    path: "/me/settlement-account",
    sample: "/me/settlement-account",
    title: "정산 계좌 등록",
    description: "은행·계좌번호·예금주 등록 및 변경",
    area: "member",
  },
  {
    path: "/me/character",
    sample: "/me/character",
    title: "내 캐릭터 변경",
    description: "대기실·결과 화면에 닉네임과 함께 보이는 캐릭터 12종 중 선택",
    area: "member",
  },
  {
    path: "/me/coins",
    sample: "/me/coins",
    title: "코인 내역",
    description: "보유 코인, 충전·사용 내역 (전체 / 충전 / 사용 필터)",
    area: "member",
  },
  {
    path: "/me/coins/charge",
    sample: "/me/coins/charge",
    title: "코인 충전",
    description: "충전 금액·결제 수단 선택 → 포트원 결제창 (1 C = ₩1)",
    area: "member",
  },
  {
    path: "/me/coins/charge/complete",
    sample: "/me/coins/charge/complete",
    title: "코인 충전 완료",
    description: "충전 결과·잔액 확인",
    area: "member",
  },
  {
    path: "/me/payment-methods",
    sample: "/me/payment-methods",
    title: "결제 수단 관리",
    description: "연결된 간편결제·카드 목록, 기본 수단 변경·삭제·추가",
    area: "member",
  },
  {
    path: "/me/notifications",
    sample: "/me/notifications",
    title: "알림 설정",
    description: "세션 시작·별점 요청·정산 완료·마케팅 알림 토글",
    area: "member",
  },
  {
    path: "/me/withdraw",
    sample: "/me/withdraw",
    title: "회원 탈퇴",
    description: "삭제되는 항목 안내·확인 후 탈퇴",
    area: "member",
  },
  // 방 참여
  {
    path: "/join",
    sample: "/join",
    title: "게스트 입장",
    description: "로그인 없이 PIN·닉네임·캐릭터를 정하고 입장",
    area: "participant",
  },
  {
    path: "/play/[code]",
    sample: "/play/482913",
    title: "풀이",
    description: "문항·선택지·서술 입력, 타이머, 제출, 음성 힌트 수신 배너·재생",
    area: "participant",
  },
  {
    path: "/result/[sessionId]",
    sample: "/result/1",
    title: "결과·리포트",
    description: "점수·랭킹, 문제별 피드백, 취약점 리포트, 세션 별점·코멘트, 게스트 가입 유도",
    area: "participant",
  },
  {
    path: "/pay/[code]",
    sample: "/pay/482913",
    title: "유료 방 결제",
    description:
      "방 정보·참가자 정보 확인, 코인 잔액 확인 → 부족분 포트원 충전 → 코인 차감, 결제 완료 후 대기실 입장 (회원 전용)",
    area: "participant",
    nav: "/home",
  },
  // 방 개설·운영
  {
    path: "/host/rooms",
    sample: "/host/rooms",
    title: "내가 만든 방",
    description: "명성 등급·승급 조건, 진행 중 방(진행 화면 열기)·종료된 방(상세 리포트) 목록",
    area: "host",
  },
  {
    path: "/host/sets",
    sample: "/host/sets",
    title: "문제 세트",
    description: "내 문제 세트 목록·재활용, 우측 패널 미리보기",
    area: "host",
  },
  {
    path: "/host/rooms/new",
    sample: "/host/rooms/new",
    title: "방 설정",
    description: "방 이름·문제 세트 선택, 6자리 PIN 발급 (방 만들기 1/3)",
    area: "host",
  },
  {
    path: "/host/editor",
    sample: "/host/editor",
    title: "문제 에디터",
    description: "AI 생성 조건 입력, 생성 결과 검토·수정, 직접 출제",
    area: "host",
  },
  {
    path: "/host/rooms/[code]/timing",
    sample: "/host/rooms/482913/timing",
    title: "문항별 시간 설정",
    description: "방에 붙은 세트의 문항별 제한 시간·자동 넘김 일괄/개별 조정",
    area: "host",
  },
  {
    path: "/host/rooms/[code]/lobby",
    sample: "/host/rooms/482913/lobby",
    title: "대기실",
    description: "PIN/QR 표시, 학생 목록 (프로젝터 투사 가정)",
    area: "host",
  },
  {
    path: "/host/rooms/[code]/live",
    sample: "/host/rooms/482913/live",
    title: "진행 화면",
    description: "문항·타이머·제출 현황·랭킹, PTT 음성 힌트 버튼",
    area: "host",
  },
  {
    path: "/host/rooms/[code]/result",
    sample: "/host/rooms/482913/result",
    title: "문항 결과",
    description: "문항별 정답·선택 분포·랭킹 변동 (프로젝터 투사 가정)",
    area: "host",
  },
  {
    path: "/host/rooms/[code]/final",
    sample: "/host/rooms/482913/final",
    title: "최종 순위",
    description: "세션 종료 후 포디움·전체 순위·세션 요약 (프로젝터 투사 가정)",
    area: "host",
  },
  {
    path: "/host/sessions/[sessionId]/review",
    sample: "/host/sessions/1/review",
    title: "방 리포트",
    description:
      "종료된 방의 통계·문항별 결과, 서술형 AI 분석 확인·코멘트 (내가 만든 방 › 상세 보기)",
    area: "host",
  },
  // 관리자
  {
    path: "/admin/dashboard",
    sample: "/admin/dashboard",
    title: "대시보드",
    description: "서비스 전체 이용 현황과 주요 지표",
    area: "admin",
  },
  {
    path: "/admin/users",
    sample: "/admin/users",
    title: "사용자 관리",
    description: "전체 사용자 · 선생님 / 학생 구분 및 계정 관리",
    area: "admin",
  },
  {
    path: "/admin/rooms",
    sample: "/admin/rooms",
    title: "방 · 문제 관리",
    description: "진행 중인 방과 AI 생성 문제 검수",
    area: "admin",
  },
  {
    path: "/admin/reports",
    sample: "/admin/reports",
    title: "신고 · 제재 관리",
    description: "접수된 신고 처리와 계정 제재 이력",
    area: "admin",
  },
  {
    path: "/admin/payments",
    sample: "/admin/payments",
    title: "결제 · 정산",
    description: "유료 방 결제 현황과 선생님 정산",
    area: "admin",
  },
  {
    path: "/admin/branded",
    sample: "/admin/branded",
    title: "광고 · 브랜디드 퀴즈",
    description: "광고 캠페인 집행과 기업 브랜디드 퀴즈 운영",
    area: "admin",
  },
];

export const REDIRECTS: readonly { from: string; to: string }[] = [
  { from: "/host", to: "/home" },
  { from: "/host/dashboard", to: "/home" },
  { from: "/host/revenue", to: "/me/settlement" },
  { from: "/admin", to: "/admin/dashboard" },
];

/** 회원 공통 내비 5개 (디자인 웹 v6 사이드바: 홈 / 내가 만든 방 / 참여한 방 / 문제 세트 / 마이페이지). 정산·설정은 마이페이지 안에서 진입한다. */
const MEMBER_NAV = [
  { path: "/home" },
  { path: "/host/rooms" },
  { path: "/me/joined" },
  { path: "/host/sets" },
  { path: "/me" },
] as const;

/** 사이드바에 노출할 항목. 순서대로 그린다. label을 생략하면 라우트 title을 쓴다. */
export const SIDEBAR_NAV: Record<
  "host" | "member" | "admin",
  readonly { path: string; label?: string }[]
> = {
  /** 계정은 하나 — 호스트 화면과 마이페이지가 같은 내비를 쓴다 */
  host: MEMBER_NAV,
  member: MEMBER_NAV,
  /** 관리자는 features/admin/layout/admin-sidebar.tsx가 routesByArea("admin")로 직접 그린다. 여기는 참고용 */
  admin: [
    { path: "/admin/dashboard" },
    { path: "/admin/users" },
    { path: "/admin/rooms" },
    { path: "/admin/reports" },
    { path: "/admin/payments" },
    { path: "/admin/branded" },
  ],
};

export function getRoute(path: string): RouteMeta {
  const route = ROUTES.find((r) => r.path === path);
  if (!route) {
    throw new Error(`routes.ts에 등록되지 않은 경로: ${path}`);
  }
  return route;
}

export function routesByArea(area: Area): RouteMeta[] {
  return ROUTES.filter((r) => r.area === area);
}

/** 실제 pathname(/pay/482913)에 해당하는 라우트. 동적 세그먼트([code] 등)는 아무 값이나 허용. 없으면 undefined */
export function matchRoute(pathname: string): RouteMeta | undefined {
  return ROUTES.find((r) =>
    new RegExp("^" + r.path.replace(/\[[^\]]+\]/g, "[^/]+") + "$").test(pathname),
  );
}
