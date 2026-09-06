import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitRating } from "@/lib/api/ratings";
import type { SubmitRatingRequest } from "@/lib/types/dto";
import { qk } from "./keys";

/**
 * POST /rooms/{roomId}/ratings — 세션당 1회. 성공 시 내 결과를 갱신해 `alreadyRated`가 따라오게 한다.
 * 409 `ALREADY_RATED`·`RATING_WINDOW_CLOSED`, 403 `RATING_NOT_ALLOWED`.
 */
export function useSubmitRating(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SubmitRatingRequest) => submitRating(roomId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.myResult(roomId) });
    },
  });
}
