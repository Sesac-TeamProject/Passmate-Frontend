/**
 * 세션 별점·평가 — **제출 API는 아직 없다**(백엔드에 `rating` 컨트롤러가 없다).
 * 가능 여부(`RatingAvailability`)만 내 결과 응답에 실려 온다.
 */

/** 평가가 막힌 이유 — 백엔드 `rating/dto/RatingAvailability.kt` */
export type RatingBlockedReason =
  "SESSION_NOT_ENDED" | "NO_SUBMISSION" | "WINDOW_CLOSED" | "ALREADY_RATED";

/** `MySessionResultResponse.rating` — 별점 시트를 열지 말지 이 값으로 정한다 */
export type RatingAvailability = {
  available: boolean;
  blockedReason?: RatingBlockedReason;
  alreadyRated: boolean;
  /** 평가 마감 시각(세션 종료 + 24시간) */
  deadline?: string;
};

/** @draft 평가 태그 — 서버 enum이 아직 없다(ERD `room_rating.tags` 5종 문구 후보) */
export type RatingTag =
  "CLEAR_EXPLANATION" | "GOOD_DIFFICULTY" | "GOOD_PACING" | "HELPFUL_HINTS" | "GOOD_QUALITY";

/** @draft POST /rooms/{roomId}/ratings — **백엔드 미구현**(실서버 404). 목에서만 동작한다 */
export type SubmitRatingRequest = {
  stars: 1 | 2 | 3 | 4 | 5;
  tags: RatingTag[];
  comment?: string;
};
