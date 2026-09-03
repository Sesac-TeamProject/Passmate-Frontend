"use client";

import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toSettlementAccount, toSettlementRows, toSettlementStats } from "@/features/me/adapt";
import { SettlementPage } from "@/features/me/settlement/settlement-page";
import { useEarnings, useSettlementAccount } from "@/lib/queries/use-payments";
import { AppError } from "@/lib/types/app-error";

export default function Page() {
  const earnings = useEarnings();
  const account = useSettlementAccount();

  const isAccountNotRegistered =
    account.isError && AppError.isAppError(account.error) && account.error.kind === "NotFound";

  if (earnings.isPending || account.isPending) return <ScreenLoading />;
  if (earnings.isError)
    return <ScreenError message={earnings.error.message} onRetry={() => earnings.refetch()} />;
  if (account.isError && !isAccountNotRegistered)
    return <ScreenError message={account.error.message} onRetry={() => account.refetch()} />;

  return (
    <SettlementPage
      stats={toSettlementStats(earnings.data)}
      rows={toSettlementRows(earnings.data.earnings ?? [])}
      account={account.isSuccess ? toSettlementAccount(account.data) : null}
    />
  );
}
