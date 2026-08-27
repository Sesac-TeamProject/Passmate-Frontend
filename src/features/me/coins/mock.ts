// 데이터 연동 전 화면 확인용 목업 (코인 내역 C-02-9 · 코인 충전 C-02-4/5/6).
// TODO(API): 코인 잔액·내역 DTO 계약이 없다 — lib/types/dto.ts 갱신 후 lib/queries 로 교체한다.

/** 보유 코인 (1 C = ₩1) */
export const COIN_BALANCE = 1200;

/** 충전 금액 프리셋(원). 시안에 직접 입력은 없다 */
export const CHARGE_PRESETS = [5000, 10000, 30000, 50000] as const;

export const DEFAULT_CHARGE_AMOUNT = 10000;

export type CoinHistoryFilter = "all" | "charge" | "use";

export const COIN_HISTORY_FILTER_LABEL: Record<CoinHistoryFilter, string> = {
  all: "전체",
  charge: "충전",
  use: "사용",
};

export const COIN_HISTORY_FILTERS: CoinHistoryFilter[] = ["all", "charge", "use"];

export type CoinHistoryItem = {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  title: string;
  /** 양수 = 충전, 음수 = 사용 */
  amount: number;
};

/** 합계 1,200 C — COIN_BALANCE 와 일치 */
export const COIN_HISTORY: CoinHistoryItem[] = [
  { id: "h1", date: "2026-08-22", title: "Spring 실전 모의고사 참가비", amount: -10000 },
  { id: "h2", date: "2026-08-20", title: "카카오페이 충전", amount: 10000 },
  { id: "h3", date: "2026-08-15", title: "CS 기술면접 라운드 2 참가비", amount: -5000 },
  { id: "h4", date: "2026-08-10", title: "카카오페이 충전", amount: 5000 },
  { id: "h5", date: "2026-08-01", title: "가입 보너스", amount: 1200 },
];

export function filterCoinHistory(
  items: CoinHistoryItem[],
  filter: CoinHistoryFilter,
): CoinHistoryItem[] {
  if (filter === "charge") return items.filter((item) => item.amount > 0);
  if (filter === "use") return items.filter((item) => item.amount < 0);
  return items;
}
