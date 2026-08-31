import { formatNumber } from "@/lib/format";
import type { AdminUserFilter, AdminUsersResponse } from "@/lib/types/dto";
import { AdminCard } from "../components/admin-card";
import { AdminCardHead } from "../components/admin-card-head";
import { UserFilters } from "./user-filters";
import { UserTable } from "./user-table";

type Props = {
  data: AdminUsersResponse;
  filter: AdminUserFilter;
  onFilterChange: (next: AdminUserFilter) => void;
};

/** A-02 사용자 관리 렌더 전용 뷰. 필터 상태·쿼리는 page가 소유한다 (규칙 문서 §11-1). */
export function AdminUsersView({ data, filter, onFilterChange }: Props) {
  const countLabel = `${formatNumber(data.total)}명 중 ${formatNumber(data.items.length)}명 표시`;

  return (
    <div className="flex flex-1 flex-col gap-[14px] px-7 pt-4 pb-[14px]">
      <UserFilters value={filter} counts={data.counts} onChange={onFilterChange} />
      <AdminCard className="min-h-0 flex-1">
        <AdminCardHead title="사용자 목록" hint={countLabel} />
        <UserTable users={data.items} />
      </AdminCard>
    </div>
  );
}
