import { useQuery } from "@tanstack/react-query";
import { getAdminBrandedQuizzes } from "@/lib/api/admin";

export const ADMIN_BRANDED_QUIZZES_KEY = ["admin", "branded-quizzes"] as const;

/** A-06 기업 브랜디드 퀴즈 */
export function useAdminBrandedQuizzes() {
  return useQuery({ queryKey: ADMIN_BRANDED_QUIZZES_KEY, queryFn: getAdminBrandedQuizzes });
}
