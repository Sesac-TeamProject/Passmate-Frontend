import { useQuery } from "@tanstack/react-query";
import { getAdminPayments } from "@/lib/api/admin";

export const ADMIN_PAYMENTS_KEY = ["admin", "payments"] as const;

/** A-05 결제 KPI + 결제 내역 */
export function useAdminPayments() {
  return useQuery({ queryKey: ADMIN_PAYMENTS_KEY, queryFn: getAdminPayments });
}
