import { useQuery } from "@tanstack/react-query";
import { getAdminSettlements } from "@/lib/api/admin";

export const ADMIN_SETTLEMENTS_KEY = ["admin", "settlements", "pending"] as const;

/** A-05 정산 대기 선생님 */
export function useAdminSettlements() {
  return useQuery({ queryKey: ADMIN_SETTLEMENTS_KEY, queryFn: getAdminSettlements });
}
