import { useQuery } from "@tanstack/react-query";
import { getAdminReviewQueue } from "@/lib/api/admin";

export const ADMIN_REVIEW_QUEUE_KEY = ["admin", "questions", "review-queue"] as const;

/** A-03 문제 검수 큐 */
export function useAdminReviewQueue() {
  return useQuery({ queryKey: ADMIN_REVIEW_QUEUE_KEY, queryFn: getAdminReviewQueue });
}
