import type { RoomRatingResponse, SubmitRatingRequest } from "@/lib/types/dto";
import { request } from "./client";

/**
 * POST /rooms/{roomId}/ratings — 세션당 1회. **201**로 만들어진 평가를 돌려준다.
 * 409 `ALREADY_RATED`·`RATING_WINDOW_CLOSED`·`SESSION_NOT_ENDED`, 403 `RATING_NOT_ALLOWED`(미제출자).
 */
export function submitRating(
  roomId: number,
  body: SubmitRatingRequest,
): Promise<RoomRatingResponse> {
  return request<RoomRatingResponse>(`/rooms/${roomId}/ratings`, { method: "POST", body });
}
