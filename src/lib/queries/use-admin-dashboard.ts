import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard } from "@/lib/api/admin";

export const ADMIN_DASHBOARD_KEY = ["admin", "dashboard"] as const;

/** A-01 대시보드 전체 지표 */
export function useAdminDashboard() {
  return useQuery({ queryKey: ADMIN_DASHBOARD_KEY, queryFn: getAdminDashboard });
}
