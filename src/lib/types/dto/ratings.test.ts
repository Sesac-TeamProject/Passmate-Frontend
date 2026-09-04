import { describe, expect, it } from "vitest";
import { RATING_TAGS, RATING_TAG_LABEL } from "@/features/participant/result/rating-tags";
import { __resetResultsForTests, mockSubmitRating } from "@/lib/mocks/results";
import { ERROR_CODES } from "@/lib/types/error-codes";
import { RATING_COMMENT_MAX } from "./ratings";
import { expectContract } from "./expect-contract";

/**
 * 백엔드 `rating` 패키지(develop @ 9e39ce3)와 1:1인지 고정한다.
 *
 * 이 도메인도 오래 `@draft`로 두었던 자리라 **태그 이름을 시안 문구에서 추측**했고
 * 5개 중 셋이 서버 enum과 어긋나 있었다. 태그를 고르면 400이 나는데 타입 검사에는
 * 안 걸린다 — 이름이 다시 갈라지면 여기서 잡는다.
 */
const SERVER_RATING_TAGS = [
  "CLEAR_EXPLANATION",
  "FAIR_DIFFICULTY",
  "GOOD_PACING",
  "HELPFUL_HINT",
  "GOOD_QUESTIONS",
] as const;

describe("별점·평가 계약", () => {
  it("태그 값이 서버 enum과 같다 — 추측한 이름으로 보내면 400이다", () => {
    expect(RATING_TAGS).toEqual([...SERVER_RATING_TAGS]);
    // 예전에 들고 있던 추측 이름들
    expect(RATING_TAGS).not.toContain("GOOD_DIFFICULTY");
    expect(RATING_TAGS).not.toContain("HELPFUL_HINTS");
    expect(RATING_TAGS).not.toContain("GOOD_QUALITY");
  });

  /**
   * 문구까지 값으로 고정한다. truthy만 보면 아무 문자열이나 통과해, 예전처럼 시안 문구로
   * 추측해 놓고도 초록으로 지나간다. 이 값들은 서버 `RatingTag` enum의 label이고,
   * 호스트가 보는 집계(`RoomRatingListResponse.tagCounts[].label`)에도 같은 문구가 실려 온다 —
   * 어긋나면 학생 화면의 칩과 선생님 화면의 집계가 같은 태그를 다른 말로 부른다.
   */
  it("태그 문구가 서버 label과 같다", () => {
    expect(RATING_TAG_LABEL).toEqual({
      CLEAR_EXPLANATION: "설명이 명확해요",
      FAIR_DIFFICULTY: "난이도가 적당해요",
      GOOD_PACING: "시간 배분이 좋아요",
      HELPFUL_HINT: "힌트가 도움됐어요",
      GOOD_QUESTIONS: "문제 품질이 좋아요",
    });
  });

  it("서버가 막는 값은 목도 막는다 — 별점 범위·태그 수·후기 길이", () => {
    __resetResultsForTests();
    const invalid = expect.objectContaining({ code: ERROR_CODES.INVALID_INPUT });

    expect(() => mockSubmitRating({ stars: 0 as 1 })).toThrowError(invalid);
    expect(() => mockSubmitRating({ stars: 6 as 5 })).toThrowError(invalid);
    expect(() =>
      mockSubmitRating({ stars: 5, comment: "가".repeat(RATING_COMMENT_MAX + 1) }),
    ).toThrowError(invalid);
  });

  it("제출은 별점만 필수다 — 태그·후기 없이도 낼 수 있다", () => {
    __resetResultsForTests();
    const created = mockSubmitRating({ stars: 5 });

    expectContract(created, ["id", "stars", "tags", "createdAt"], ["comment"]);
    expect(created.tags).toEqual([]);
  });

  it("제출은 201로 만들어진 평가를 돌려준다 — void로 두면 응답을 버린다", () => {
    __resetResultsForTests();
    const created = mockSubmitRating({ stars: 4, tags: ["HELPFUL_HINT"], comment: "좋았어요" });

    expect(created.stars).toBe(4);
    expect(created.tags).toEqual(["HELPFUL_HINT"]);
    expect(created.comment).toBe("좋았어요");
  });

  it("두 번째 제출은 409 ALREADY_RATED다 — 세션당 1회", () => {
    __resetResultsForTests();
    mockSubmitRating({ stars: 3 });

    expect(() => mockSubmitRating({ stars: 3 })).toThrowError(
      expect.objectContaining({ code: ERROR_CODES.ALREADY_RATED }),
    );
  });
});
