"use client";

import { useState } from "react";
import { CoinsPage } from "@/features/me/coins/coins-page";
import {
  COIN_BALANCE,
  COIN_HISTORY,
  filterCoinHistory,
  type CoinHistoryFilter,
} from "@/features/me/coins/mock";

/** C-02-9 컨테이너. 필터(로컬 UI 상태)를 소유하고 렌더는 CoinsPage에 맡긴다. */
export default function Page() {
  const [filter, setFilter] = useState<CoinHistoryFilter>("all");

  // TODO(API): ['me','coins','history',filter] 쿼리로 교체 — 지금은 목 잔액·내역
  const items = filterCoinHistory(COIN_HISTORY, filter);

  return (
    <CoinsPage balance={COIN_BALANCE} filter={filter} onFilterChange={setFilter} items={items} />
  );
}
