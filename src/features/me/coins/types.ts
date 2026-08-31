// 코인 내역(C-02-9) · 코인 충전(C-02-4/5/6) 뷰 타입. API 응답 → 이 타입 변환은 ../adapt.ts가 맡는다.

/** 충전 금액 프리셋(원) — 시안 정책값, 서버 데이터가 아닌 UI 상수로 둔다. 시안에 직접 입력은 없다 */
export const CHARGE_PRESETS = [5000, 10000, 30000, 50000] as const;

export const DEFAULT_CHARGE_AMOUNT = 10000;

export type CoinHistoryFilter = "all" | "charge" | "use";

/** 필터 탭 라벨 — UI 상수 */
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
  /** 양수 = 충전 · 환급, 음수 = 사용 */
  amount: number;
};
