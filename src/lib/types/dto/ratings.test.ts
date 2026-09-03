import { describe, expect, it } from "vitest";
import { RATING_TAGS, RATING_TAG_LABEL } from "@/features/participant/result/rating-tags";
import { __resetResultsForTests, mockSubmitRating } from "@/lib/mocks/results";
import { ERROR_CODES } from "@/lib/types/error-codes";
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

  it("태그마다 문구가 있다 — 하나라도 비면 학생 화면에 빈 칩이 뜬다", () => {
    for (const tag of SERVER_RATING_TAGS) {
      expect(RATING_TAG_LABEL[tag]).toBeTruthy();
    }
    expect(Object.keys(RATING_TAG_LABEL)).toHaveLength(SERVER_RATING_TAGS.length);
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
