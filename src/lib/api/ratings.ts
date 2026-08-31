import type { SubmitRatingRequest } from "@/lib/types/dto";
import { request } from "./client";

/** POST /rooms/{roomId}/ratings — 세션당 1회. 409 ALREADY_RATED, 410 평가 기간(24h) 경과 */
export function submitRating(roomId: number, body: SubmitRatingRequest): Promise<void> {
  return request<void>(`/rooms/${roomId}/ratings`, { method: "POST", body });
}
