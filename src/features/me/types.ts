// 마이페이지(C-02 v3) 공용 뷰 타입. API 응답 → 이 타입 변환은 ./adapt.ts가 맡는다.
import type { AvatarKey } from "@/components/common/student-avatar";

/** 프로필 카드 — 명성(레벨)은 방 운영 실적으로 오른다 */
export type Profile = {
  /** 가입한 이름(예금주와 같아야 한다). 계약에 별도 필드가 없어 닉네임과 같다 */
  name: string;
  /** 방 안에서 학생·선생님에게 보이는 이름 */
  nickname: string;
  email: string;
  joinedLabel: string;
  avatar: AvatarKey;
  /**
   * 호스트 등급. `MyProfileResponse`에는 없고 **`GET /users/me/grade`가 계산해서 준다** —
   * 그 조회가 아직 안 끝났거나 실패하면 값이 비고, 그때 화면은 뱃지·진행률을 **그리지 않는다**.
   * 0·Lv.1로 대체하지 말 것(없는 사실을 만든다).
   */
  level?: number;
  levelTitle?: string;
  /** 현재 레벨로 열리는 권한. 예: "유료 방 개설 가능" */
  levelPerk?: string;
  /** 다음 레벨까지 남은 실적 */
  /** 서버가 그 조건을 안 주면 각 칸은 null이다 — 0으로 채우지 않는다 */
  nextLevel?: { level: number; roomsLeft: number | null; studentsLeft: number | null };
  /** 다음 레벨까지 진행률(%) */
  progress?: number;
};

/** 유료 방 개설이 열리는 최소 레벨. features/host/room-flow/adapt.ts PAID_ROOM_MIN_LEVEL과 값을 맞춰 여기 복제해 뒀다(공용화 TODO). */
export const PAID_ROOM_MIN_LEVEL = 3;

/** C-02 v3 카드/코인 · 결제 */
export type CoinSummary = {
  /** 보유 코인 (1C = ₩1) */
  balance: number;
  /** 기본 결제 수단 라벨. 예: "카카오페이 (기본) · 포트원 안전결제" */
  paymentMethodLabel: string;
  /** 최근 사용·충전 1건. 서버 recent가 없으면 null */
  lastTransaction: { dateLabel: string; title: string; amount: number } | null;
};

/** 정산 계좌 — C-02 v3 · C-02-3 · W-10이 같은 값을 쓴다 */
export type SettlementAccount = {
  bank: string;
  /** 화면 표시용 마스킹 계좌번호. 예: "***-***-4821" */
  maskedNumber: string;
  /** 등록 폼 초기값(원문 계좌번호) */
  accountNumber: string;
  holder: string;
};

/**
 * C-02-3 은행 선택지 — 정책 목록이라 서버 데이터가 아닌 UI 상수로 둔다.
 *
 * 코드는 금융결제원 표준 코드다. 서버는 받은 값을 **검증 없이 그대로 저장**하므로
 * (백엔드 `SettlementAccountService`) 실제 지급 전에 팀이 한 번 확인해야 한다.
 */
export const BANK_CODES: Record<string, string> = {
  국민은행: "004",
  신한은행: "088",
  우리은행: "020",
  하나은행: "081",
  카카오뱅크: "090",
  토스뱅크: "092",
};

export const BANKS = Object.keys(BANK_CODES) as readonly string[];

/** C-02 v3 카드/정산 — 이번 달 정산 예정 요약 */
export type SettlementSummary = {
  /** 정산 예정 금액(원) */
  thisMonthAmount: number;
  /** 지급일 표기. 예: "9/5" */
  payoutDateLabel: string;
  /** 선생님 몫 비율(%) */
  hostShare: number;
  /** 유료 방 개설이 열리는 레벨 */
  paidRoomLevel: number;
  /** 세금 안내 한 줄 — 고정 정책 문구, 계약에 없다 */
  taxNote: string;
};

/** C-02 v3 카드/알림 · 기타 — 알림 행 설명. 항목 이름 나열이라 서버 데이터가 아닌 UI 상수로 둔다 */
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

export type AttendedSession = {
  id: string;
  /**
   * 내 등수. **아직 안 끝난 방은 값이 없다** — 0으로 채우면 "0위"라는 없는 사실이 된다
   * (서버가 `myRank`를 아예 주지 않는다).
   */
  rank: number | null;
  title: string;
  dateLabel: string;
  questionCount: number;
  /** 내 점수. 채점 전이면 없다 */
  score: number | null;
  /** 학습 리포트가 만들어졌는가 — false면 리포트 링크를 걸지 않는다 */
  hasReport: boolean;
};

/** 참여한 방(client) 학습 기록 */
export type LearningRecord = {
  stats: { sessions: number; accuracy: number; averageRank: number };
  weakTopics: string[];
  sessions: AttendedSession[];
};
