import { useQuery } from "@tanstack/react-query";
import { getAdminReports } from "@/lib/api/admin";

export const ADMIN_REPORTS_KEY = ["admin", "reports"] as const;

/** A-04 신고 KPI + 신고 목록 */
export function useAdminReports() {
  return useQuery({ queryKey: ADMIN_REPORTS_KEY, queryFn: getAdminReports });
}
