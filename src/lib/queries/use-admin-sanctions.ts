import { useQuery } from "@tanstack/react-query";
import { getAdminSanctions } from "@/lib/api/admin";

export const ADMIN_SANCTIONS_KEY = ["admin", "sanctions"] as const;

/** A-04 최근 30일 제재 이력 */
export function useAdminSanctions() {
  return useQuery({ queryKey: ADMIN_SANCTIONS_KEY, queryFn: getAdminSanctions });
}
