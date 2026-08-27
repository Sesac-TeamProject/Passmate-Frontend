"use client";

import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { AdminDashboardView } from "@/features/admin/dashboard/admin-dashboard-view";
import { AdminPageHeader } from "@/features/admin/layout/admin-page-header";
import { useAdminDashboard } from "@/lib/queries/use-admin-dashboard";

const ROUTE_PATH = "/admin/dashboard";

/** A-01 컨테이너. 쿼리 연결과 로딩·에러 분기만 하고 렌더는 View에 맡긴다. */
export default function Page() {
  const { data, dataUpdatedAt, isPending, isError, error, refetch } = useAdminDashboard();

  const handleRetry = () => {
    void refetch();
  };

  let body: React.ReactNode;
  if (isPending) {
    body = <ScreenLoading />;
  } else if (isError) {
    body = <ScreenError message={error.message} onRetry={handleRetry} />;
  } else {
    body = <AdminDashboardView data={data} fetchedAtMs={dataUpdatedAt} />;
  }

  return (
    <>
      <AdminPageHeader path={ROUTE_PATH} />
      {body}
    </>
  );
}
