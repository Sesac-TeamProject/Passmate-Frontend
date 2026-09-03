"use client";

import { useState } from "react";

import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toSettlementAccount, toSettlementRows, toSettlementStats } from "@/features/me/adapt";
import { SettlementPage } from "@/features/me/settlement/settlement-page";
import { useEarnings, useSettlementAccount } from "@/lib/queries/use-payments";
import { exportEarnings } from "@/lib/api/payments";
import { AppError } from "@/lib/types/app-error";

export default function Page() {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    setExportError(null);
    setExporting(true);
    try {
      await exportEarnings();
    } catch {
      // 서버는 CSV만 받는다 — 다른 실패도 같은 안내로 접는다
      setExportError("내보내지 못했어요. 잠시 뒤 다시 시도해 주세요");
    } finally {
      setExporting(false);
    }
  };

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
      onExport={handleExport}
      exporting={exporting}
      exportError={exportError}
    />
  );
}
