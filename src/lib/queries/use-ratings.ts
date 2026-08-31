import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitRating } from "@/lib/api/ratings";
import type { SubmitRatingRequest } from "@/lib/types/dto";
import { qk } from "./keys";

/** POST /rooms/{roomId}/ratings — 세션당 1회. 409 ALREADY_RATED, 410 평가 기간(24h) 경과. 성공 시 내 결과를 갱신한다 */
export function useSubmitRating(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SubmitRatingRequest) => submitRating(roomId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.myResult(roomId) });
    },
  });
}
