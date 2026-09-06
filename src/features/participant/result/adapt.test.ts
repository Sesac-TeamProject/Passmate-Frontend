import { describe, expect, it } from "vitest";
import { canRequestAnalysis, toRankText } from "./adapt";

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

describe("canRequestAnalysis", () => {
  it("아직 요청하지 않았거나 실패했을 때만 보인다", () => {
    expect(canRequestAnalysis("ESSAY", true, "NOT_REQUESTED")).toBe(true);
    expect(canRequestAnalysis("ESSAY", true, "FAILED")).toBe(true);
  });

  it("이미 걸린 건과 끝난 건에는 숨긴다 — 서버가 그대로 돌려줘 눌러도 화면이 그대로다", () => {
    expect(canRequestAnalysis("ESSAY", true, "PENDING")).toBe(false);
    expect(canRequestAnalysis("ESSAY", true, "DONE")).toBe(false);
  });

  it("게스트에게는 숨긴다 — 눌러도 403이다", () => {
    expect(canRequestAnalysis("ESSAY", false, "NOT_REQUESTED")).toBe(false);
    expect(canRequestAnalysis("ESSAY", false, "FAILED")).toBe(false);
  });

  it("서술형이 아니면 숨긴다", () => {
    expect(canRequestAnalysis("MCQ", true, "NOT_REQUESTED")).toBe(false);
    expect(canRequestAnalysis("OX", true, "NOT_REQUESTED")).toBe(false);
  });
});
