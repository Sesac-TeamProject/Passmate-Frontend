import { useQuery } from "@tanstack/react-query";
import { getAdminRooms } from "@/lib/api/admin";

export const ADMIN_ROOMS_KEY = ["admin", "rooms"] as const;

/** A-03 방 목록 + 요약 수 */
export function useAdminRooms() {
  return useQuery({ queryKey: ADMIN_ROOMS_KEY, queryFn: getAdminRooms });
}
