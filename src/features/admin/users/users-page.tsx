"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { AdminCard } from "../components/admin-card";
import { TYPE } from "../components/typography";
import { AdminPageHeader } from "../layout/admin-page-header";
import { ADMIN_USERS, USER_TOTAL_LABEL, type UserFilter } from "../mock";
import { UserFilters } from "./user-filters";
import { UserTable } from "./user-table";

/** A-02 사용자 관리. */
export function UsersPage() {
  const [filter, setFilter] = useState<UserFilter>("all");

  const users = useMemo(() => {
    if (filter === "all") return ADMIN_USERS;
    if (filter === "sanctioned")
      return ADMIN_USERS.filter((u) => u.status.label.startsWith("제재"));
    return ADMIN_USERS.filter((u) => u.role === filter);
  }, [filter]);

  return (
    <>
      <AdminPageHeader path="/admin/users" />
      <div className="flex flex-1 flex-col gap-[14px] px-7 pt-4 pb-[14px]">
        <UserFilters value={filter} onChange={setFilter} />
        <AdminCard className="min-h-0 flex-1">
          <div className="flex w-full items-center gap-2">
            <h2 className={cn("text-[#1b1733]", TYPE.labelLg)}>사용자 목록</h2>
            <p className={cn("text-[#6e6a85]", TYPE.labelMd)}>
              {filter === "all" ? USER_TOTAL_LABEL : `${users.length}명 표시`}
            </p>
          </div>
          <UserTable users={users} />
        </AdminCard>
      </div>
    </>
  );
}
