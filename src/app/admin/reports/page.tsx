"use client";

import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { AdminPageHeader } from "@/features/admin/layout/admin-page-header";
import { AdminReportsView } from "@/features/admin/reports/admin-reports-view";
import { useAdminReports } from "@/lib/queries/use-admin-reports";
import { useAdminSanctions } from "@/lib/queries/use-admin-sanctions";

const ROUTE_PATH = "/admin/reports";

/** A-04 컨테이너. 신고·제재 두 쿼리를 묶어 로딩·에러를 화면 단위로 분기한다. */
export default function Page() {
  const reports = useAdminReports();
  const sanctions = useAdminSanctions();

  const isPending = reports.isPending || sanctions.isPending;
  const error = reports.error ?? sanctions.error;

  const handleRetry = () => {
    if (reports.isError) void reports.refetch();
    if (sanctions.isError) void sanctions.refetch();
  };

  let body: React.ReactNode;
  if (isPending) {
    body = <ScreenLoading />;
  } else if (error || !reports.data || !sanctions.data) {
    body = <ScreenError message={error?.message ?? "불러오지 못했습니다."} onRetry={handleRetry} />;
  } else {
    body = (
      <AdminReportsView
        reports={reports.data}
        sanctions={sanctions.data}
        fetchedAtMs={reports.dataUpdatedAt}
      />
    );
  }

  return (
    <>
      <AdminPageHeader path={ROUTE_PATH} />
      {body}
    </>
  );
}
