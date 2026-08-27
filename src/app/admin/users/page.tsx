"use client";

import { useState } from "react";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { AdminPageHeader } from "@/features/admin/layout/admin-page-header";
import { AdminUsersView } from "@/features/admin/users/admin-users-view";
import { useAdminUsers } from "@/lib/queries/use-admin-users";
import type { AdminUserFilter } from "@/lib/types/dto";

const ROUTE_PATH = "/admin/users";
const DEFAULT_FILTER: AdminUserFilter = "ALL";

/** A-02 컨테이너. 필터(로컬 UI 상태)와 쿼리를 소유하고 렌더는 View에 맡긴다. */
export default function Page() {
  const [filter, setFilter] = useState<AdminUserFilter>(DEFAULT_FILTER);
  const { data, isPending, isError, error, refetch } = useAdminUsers(filter);

  const handleFilterChange = (next: AdminUserFilter) => {
    setFilter(next);
  };
  const handleRetry = () => {
    void refetch();
  };

  let body: React.ReactNode;
  if (isPending) {
    body = <ScreenLoading />;
  } else if (isError) {
    body = <ScreenError message={error.message} onRetry={handleRetry} />;
  } else {
    body = <AdminUsersView data={data} filter={filter} onFilterChange={handleFilterChange} />;
  }

  return (
    <>
      <AdminPageHeader path={ROUTE_PATH} />
      {body}
    </>
  );
}
