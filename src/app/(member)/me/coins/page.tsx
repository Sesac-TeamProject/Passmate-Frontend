"use client";

import { useState } from "react";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { filterCoinHistory, toCoinHistory } from "@/features/me/adapt";
import { CoinsPage } from "@/features/me/coins/coins-page";
import type { CoinHistoryFilter } from "@/features/me/coins/types";
import { useCoinBalance, useCoinTransactions } from "@/lib/queries/use-payments";

/** C-02-9 컨테이너. 필터(로컬 UI 상태)를 소유하고 렌더는 CoinsPage에 맡긴다. */
export default function Page() {
  const [filter, setFilter] = useState<CoinHistoryFilter>("all");
  const balance = useCoinBalance();
  const transactions = useCoinTransactions();

  if (balance.isPending || transactions.isPending) return <ScreenLoading />;
  if (balance.isError)
    return <ScreenError message={balance.error.message} onRetry={() => balance.refetch()} />;
  if (transactions.isError)
    return (
      <ScreenError message={transactions.error.message} onRetry={() => transactions.refetch()} />
    );

  const items = filterCoinHistory(toCoinHistory(transactions.data.content), filter);

  return (
    <CoinsPage
      balance={balance.data.balance}
      filter={filter}
      onFilterChange={setFilter}
      items={items}
    />
  );
}
