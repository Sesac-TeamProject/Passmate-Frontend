// 데이터 연동 전 화면 확인용 목업 (회원 계정·마이페이지 C-02 v3).
// 계정은 하나다 — 같은 사람이 방을 개설(host)하기도, 참여(client)하기도 한다.
import type { AvatarKey } from "@/components/common/student-avatar";
import type { SidebarUser } from "@/components/layout/role-sidebar";

/** 로그인한 회원. 선생님·회원 레이아웃의 사이드바 프로필이 모두 이 계정을 쓴다. */
export const ACCOUNT: SidebarUser = {
  name: "이한결",
  initial: "한",
  roleLabel: "회원",
  tone: "peach",
};

/** 프로필 카드 — 명성(레벨)은 방 운영 실적으로 오른다 */
export type Profile = {
  /** 가입한 이름(예금주와 같아야 한다) */
  name: string;
  /** 방 안에서 학생·선생님에게 보이는 이름 */
  nickname: string;
  email: string;
  joinedLabel: string;
  avatar: AvatarKey;
  level: number;
  levelTitle: string;
  /** 현재 레벨로 열리는 권한. 예: "유료 방 개설 가능" */
  levelPerk: string;
  /** 다음 레벨까지 남은 실적 */
  nextLevel: { level: number; roomsLeft: number; studentsLeft: number };
  /** 다음 레벨까지 진행률(%) */
  progress: number;
};

// TODO(API): GET /me — auth-store 로그인 회원으로 교체
export const PROFILE: Profile = {
  name: "이한결",
  nickname: "한결",
  email: "hangyeol@passmate.app",
  joinedLabel: "2026-08 가입",
  avatar: "fox",
  level: 3,
  levelTitle: "검증된 운영자",
  levelPerk: "유료 방 개설 가능",
  nextLevel: { level: 4, roomsLeft: 16, studentsLeft: 88 },
  progress: 60,
};

/** 프로필 카드 우측 한 줄 "참여한 방 3 · 내가 만든 방 24" */
export const ROOM_COUNTS = { joined: 3, hosted: 24 };

/** 숫자 → "1,200" (서버·클라이언트 동일 출력을 위해 Intl 대신 정규식) */
export function formatNumber(value: number) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** 원화 표기 — W-10 정산 표는 "₩ 60,000"(공백), C-02 v3 행은 "₩64,000"(붙임) */
export function formatWon(value: number, spaced = false) {
  return `${spaced ? "₩ " : "₩"}${formatNumber(value)}`;
}

/** C-02 v3 카드/계정 — 로그인 방식·비밀번호 변경일 */
export type AccountSettings = {
  /** 이메일 행 설명에 붙는 로그인 방식. 예: "Google 로그인" */
  loginProvider: string;
  /** 마지막 비밀번호 변경일 (YYYY-MM-DD). 비밀번호 계정이 아니면 undefined */
  passwordChangedAt?: string;
};

// TODO(API): Google 로그인 계정에 비밀번호 행을 보여줄지 기획 확인 (OAuth 계정엔 비밀번호가 없다)
export const ACCOUNT_SETTINGS: AccountSettings = {
  loginProvider: "Google 로그인",
  passwordChangedAt: "2026-08-01",
};

/** C-02 v3 카드/코인 · 결제 */
export type CoinSummary = {
  /** 보유 코인 (1C = ₩1) */
  balance: number;
  /** 기본 결제 수단 라벨. 예: "카카오페이 (기본) · 포트원 안전결제" */
  paymentMethodLabel: string;
  /** 최근 사용·충전 1건 */
  lastTransaction: { dateLabel: string; title: string; amount: number };
};

// TODO(API): 코인 잔액·결제 수단·최근 내역
export const COIN_SUMMARY: CoinSummary = {
  balance: 1200,
  paymentMethodLabel: "카카오페이 (기본) · 포트원 안전결제",
  lastTransaction: { dateLabel: "8/22", title: "Spring 모의고사", amount: -10000 },
};

/** 정산 계좌 — C-02 v3 · C-02-3 · W-10이 같은 값을 쓴다 */
export type SettlementAccount = {
  bank: string;
  /** 화면 표시용 마스킹 계좌번호. 예: "***-***-4821" */
  maskedNumber: string;
  /** 등록 폼 초기값 */
  accountNumber: string;
  holder: string;
};

// TODO(API): 정산 계좌 조회·등록
export const SETTLEMENT_ACCOUNT: SettlementAccount = {
  bank: "국민은행",
  maskedNumber: "***-***-4821",
  accountNumber: "123456-01-234567",
  holder: "이한결",
};

/** C-02-3 은행 선택지 */
export const BANKS = [
  "국민은행",
  "신한은행",
  "우리은행",
  "하나은행",
  "카카오뱅크",
  "토스뱅크",
] as const;

/** C-02 v3 카드/정산 — 이번 달 정산 예정 요약 */
export type SettlementSummary = {
  /** 이번 달 정산 예정 금액(원). 참가비의 80% */
  thisMonthAmount: number;
  /** 지급일 표기. 예: "9/5" */
  payoutDateLabel: string;
  /** 선생님 몫 비율(%) */
  hostShare: number;
  /** 유료 방 개설이 열리는 레벨 */
  paidRoomLevel: number;
  /** 세금 안내 한 줄 */
  taxNote: string;
};

// TODO(API): 이번 달 정산 예정 (시안 간 불일치 — C-02 v3 ₩64,000 / W-10 이번 달 수익 ₩384,000, 기획 확인)
export const SETTLEMENT_SUMMARY: SettlementSummary = {
  thisMonthAmount: 64000,
  payoutDateLabel: "9/5",
  hostShare: 80,
  paidRoomLevel: 3,
  taxNote: "연 소득 기준 원천징수 3.3% 적용",
};

/** C-02 v3 카드/알림 · 기타 — 알림 행 설명 */
export const NOTIFICATION_SUMMARY = "세션 시작 · 별점 요청 · 정산 완료";

export type AchievementBadgeKind = "flag" | "number" | "paws" | "ring" | "drop" | "won" | "empty";

export type Achievement = {
  id: string;
  kind: AchievementBadgeKind;
  /** number·ring 뱃지에 찍히는 숫자 */
  label?: string;
  title: string;
  /** 아직 획득하지 못한 뱃지 — opacity 0.3으로 그린다 */
  locked?: boolean;
};

/** 개설한 방(host) 실적 */
export type HostRecord = {
  stats: { rooms: number; rating: number; students: number };
  badges: { earned: number; total: number; locked: number; items: Achievement[] };
  openRooms: number;
  /** 이번 달 정산 예정 금액(원) */
  settlementThisMonth: number;
};

export const HOST_RECORD: HostRecord = {
  stats: { rooms: 24, rating: 4.5, students: 312 },
  badges: {
    earned: 5,
    total: 8,
    locked: 3,
    items: [
      { id: "first-room", kind: "flag", title: "첫 방 개설" },
      { id: "rooms-10", kind: "number", label: "10", title: "방 10회 운영" },
      { id: "students-100", kind: "paws", title: "학생 100명" },
      // TODO(디자인): 시안 뱃지 시트에서 "평가 4.5+"·"AI 세트 50개"는 아이콘이 비어 있다
      { id: "rating-4.5", kind: "empty", title: "평가 4.5+", locked: true },
      { id: "reviews-50", kind: "ring", label: "50", title: "평가 50개 받기" },
      { id: "streak-30", kind: "drop", title: "30일 연속 활동", locked: true },
      { id: "paid-first", kind: "won", title: "유료 방 첫 개설" },
      { id: "ai-sets-50", kind: "empty", title: "AI 세트 50개", locked: true },
    ],
  },
  openRooms: 2,
  settlementThisMonth: 64000,
};

export type AttendedSession = {
  id: string;
  rank: number;
  title: string;
  dateLabel: string;
  questionCount: number;
  score: number;
};

/** 참여한 방(client) 학습 기록 */
export type LearningRecord = {
  stats: { sessions: number; accuracy: number; averageRank: number };
  weakTopics: string[];
  sessions: AttendedSession[];
};

export const LEARNING_RECORD: LearningRecord = {
  stats: { sessions: 3, accuracy: 71, averageRank: 3.3 },
  weakTopics: ["JPA 영속성", "트랜잭션", "인덱스"],
  sessions: [
    {
      id: "1",
      rank: 3,
      title: "8월 4주차 Spring 스터디",
      dateLabel: "8/22 (금)",
      questionCount: 8,
      score: 990,
    },
    {
      id: "2",
      rank: 2,
      title: "CS 모의면접 3회차",
      dateLabel: "8/20 (수)",
      questionCount: 10,
      score: 1120,
    },
    {
      id: "3",
      rank: 5,
      title: "JPA 복습 세션",
      dateLabel: "8/17 (일)",
      questionCount: 6,
      score: 640,
    },
  ],
};
