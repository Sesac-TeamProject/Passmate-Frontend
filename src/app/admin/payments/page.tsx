"use client";

import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { AdminPageHeader } from "@/features/admin/layout/admin-page-header";
import { AdminPaymentsView } from "@/features/admin/payments/admin-payments-view";
import { useAdminPayments } from "@/lib/queries/use-admin-payments";
import { useAdminSettlements } from "@/lib/queries/use-admin-settlements";

const ROUTE_PATH = "/admin/payments";

/** A-05 컨테이너. 결제·정산 두 쿼리를 묶어 로딩·에러를 화면 단위로 분기한다. */
export default function Page() {
  const payments = useAdminPayments();
  const settlements = useAdminSettlements();

  const isPending = payments.isPending || settlements.isPending;
  const error = payments.error ?? settlements.error;

  const handleRetry = () => {
    if (payments.isError) void payments.refetch();
    if (settlements.isError) void settlements.refetch();
  };

  let body: React.ReactNode;
  if (isPending) {
    body = <ScreenLoading />;
  } else if (error || !payments.data || !settlements.data) {
    body = <ScreenError message={error?.message ?? "불러오지 못했습니다."} onRetry={handleRetry} />;
  } else {
    body = <AdminPaymentsView payments={payments.data} settlements={settlements.data} />;
  }

  return (
    <>
      <AdminPageHeader path={ROUTE_PATH} />
      {body}
    </>
  );
}
