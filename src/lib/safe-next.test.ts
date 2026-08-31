import { describe, expect, it } from "vitest";
import { safeNextPath } from "./safe-next";

describe("safeNextPath", () => {
  it("같은 출처 절대 경로는 그대로 통과한다", () => {
    expect(safeNextPath("/home")).toBe("/home");
  });

  it("값이 없으면 기본값(홈)으로 보낸다", () => {
    expect(safeNextPath(null)).toBe("/home");
  });

  it("다른 출처 절대 URL은 홈으로 되돌린다", () => {
    expect(safeNextPath("https://evil.example")).toBe("/home");
  });

  it("프로토콜 상대 URL(//evil)은 홈으로 되돌린다", () => {
    expect(safeNextPath("//evil.example")).toBe("/home");
  });
});
