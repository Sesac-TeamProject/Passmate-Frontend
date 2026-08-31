import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAdminUsers } from "@/lib/api/admin";
import type { AdminUserFilter } from "@/lib/types/dto";

export const adminUsersKey = (filter: AdminUserFilter) => ["admin", "users", filter] as const;

/** A-02 사용자 목록. 필터를 바꿔도 이전 결과를 유지해 pill 숫자가 깜빡이지 않게 한다. */
export function useAdminUsers(filter: AdminUserFilter) {
  return useQuery({
    queryKey: adminUsersKey(filter),
    queryFn: () => getAdminUsers(filter),
    placeholderData: keepPreviousData,
  });
}
