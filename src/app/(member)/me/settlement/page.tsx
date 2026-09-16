"use client";

import { useState } from "react";

import { MobileTopBar } from "@/components/common/mobile-top-bar";
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

  // 탭바가 없는 화면(mobileBare)이라 로딩·오류에도 스스로 "← 정산" 줄을 그려야 폰에서 빠져나갈 길이 생긴다
  const mobileFailure = { screenTitle: "정산", backHref: "/me", homeHref: "/home" };

  if (earnings.isPending || account.isPending)
    return (
      <>
        {/* 성공 화면(SettlementPage)엔 여백이 있지만 여긴 감싸는 여백이 없다 — FailureScreen과 같은 자체 여백을 준다 */}
        <MobileTopBar title="정산" backHref="/me" size="sm" className="px-5 pt-11" />
        <ScreenLoading />
      </>
    );
  if (earnings.isError)
    return (
      <ScreenError
        message={earnings.error.message}
        onRetry={() => earnings.refetch()}
        mobile={{
          ...mobileFailure,
          title: "정산 내역을 불러오지 못했어요",
          description: "잠시 뒤 다시 시도해 주세요",
        }}
      />
    );
  if (account.isError && !isAccountNotRegistered)
    return (
      <ScreenError
        message={account.error.message}
        onRetry={() => account.refetch()}
        mobile={{
          ...mobileFailure,
          title: "정산 계좌 정보를 불러오지 못했어요",
          description: "잠시 뒤 다시 시도해 주세요",
        }}
      />
    );

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
