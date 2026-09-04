import { describe, expect, it } from "vitest";
import { toRankText } from "./adapt";

describe("toRankText", () => {
  it("순위만 있으면 총원 없이 순위를 적는다 — 총원은 계약에 없다", () => {
    expect(toRankText(1, null)).toBe("1위");
  });

  it("총원까지 있으면 '순위 / 총원'", () => {
    expect(toRankText(3, 24)).toBe("3위 / 24명");
  });

  it("순위가 없을 때만 집계 중이다", () => {
    expect(toRankText(null, 24)).toBe("집계 중");
    expect(toRankText(null, null)).toBe("집계 중");
  });
});
