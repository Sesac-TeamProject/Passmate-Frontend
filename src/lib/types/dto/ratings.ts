/**
 * 세션 별점·평가 — 백엔드 `rating` 패키지 1:1.
 *
 * 제출(`POST /rooms/{roomId}/ratings`)과 가능 여부(`RatingAvailability`)가 **같은 판정**을 쓴다 —
 * 조회에서 막힌 이유마다 제출 때 낼 오류 코드가 붙어 있다(`RatingBlockedReason`).
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

/**
 * 평가 태그 5종 — 백엔드 `rating/domain/RatingTag.kt`가 원본이다.
 *
 * 예전에 시안 문구로 이름을 **추측해** 셋(`GOOD_DIFFICULTY`·`HELPFUL_HINTS`·`GOOD_QUALITY`)이
 * 서버 enum과 어긋나 있었다. 태그를 고르면 400이 났고 타입 검사에는 안 걸렸다.
 * 이름은 서버가 정한다 — 문구가 바뀌어도 여기 값은 건드리지 않는다.
 */
export type RatingTag =
  "CLEAR_EXPLANATION" | "FAIR_DIFFICULTY" | "GOOD_PACING" | "HELPFUL_HINT" | "GOOD_QUESTIONS";

/**
 * POST /rooms/{roomId}/ratings — 답안을 낸 참가자만, 종료 후 기간 안에, 1회. 게스트도 낼 수 있다.
 * `stars`만 필수다 — 태그·후기는 안 골라도 된다.
 */
export type SubmitRatingRequest = {
  stars: 1 | 2 | 3 | 4 | 5;
  /** 최대 5개. 중복은 서버가 정리한다 */
  tags?: RatingTag[];
  /** 한 줄 후기(최대 500자). 호스트에게만 보인다 */
  comment?: string;
};

/** POST /rooms/{roomId}/ratings 응답 — **201**로 접수된 평가 한 건 */
export type RoomRatingResponse = {
  id: number;
  stars: number;
  tags: RatingTag[];
  comment?: string;
  createdAt: string;
};
