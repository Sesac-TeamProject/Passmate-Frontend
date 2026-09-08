import { describe, expect, it } from "vitest";
import { unitOf } from "./adapt";

describe("unitOf", () => {
  it("학생 수는 명, 별점은 점, 나머지는 회", () => {
    expect(unitOf("TOTAL_STUDENTS")).toBe("명");
    expect(unitOf("AVG_RATING")).toBe("점");
    expect(unitOf("ROOMS_HOSTED")).toBe("회");
  });
});
