export type RatingTag =
  "CLEAR_EXPLANATION" | "GOOD_DIFFICULTY" | "GOOD_PACING" | "HELPFUL_HINTS" | "GOOD_QUALITY";
/** POST /rooms/{roomId}/ratings — 세션당 1회. 409 ALREADY_RATED, 410 평가 기간(24h) 경과 */
export type SubmitRatingRequest = {
  stars: 1 | 2 | 3 | 4 | 5;
  tags: RatingTag[];
  comment?: string | null;
};
