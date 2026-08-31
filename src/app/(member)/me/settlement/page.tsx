"use client";

import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toSettlementAccount, toSettlementRows, toSettlementStats } from "@/features/me/adapt";
import { SettlementPage } from "@/features/me/settlement/settlement-page";
import { useEarnings, useSettlementAccount } from "@/lib/queries/use-payments";

export default function Page() {
  const earnings = useEarnings();
  const account = useSettlementAccount();

  if (earnings.isPending) return <ScreenLoading />;
  if (earnings.isError)
    return <ScreenError message={earnings.error.message} onRetry={() => earnings.refetch()} />;

  return (
    <SettlementPage
      stats={toSettlementStats(earnings.data)}
      rows={toSettlementRows(earnings.data.items ?? [])}
      account={account.isSuccess ? toSettlementAccount(account.data) : null}
    />
  );
}
