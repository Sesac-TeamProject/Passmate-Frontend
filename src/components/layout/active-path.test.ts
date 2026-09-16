import { describe, expect, it } from "vitest";
import { findActivePath } from "./active-path";

describe("findActivePath", () => {
  const patterns = ["/home", "/host/rooms", "/me/joined", "/me"] as const;

  it("정확히 일치하는 항목을 고른다", () => {
    expect(findActivePath("/me", patterns)).toBe("/me");
    expect(findActivePath("/me/joined", patterns)).toBe("/me/joined");
  });

  it("일치가 없으면 하위 경로 중 가장 긴 항목을 고른다", () => {
    // /me/account 는 "마이페이지"(/me) 아래다 — /me 와 /me/joined 둘 다 후보가 아니라 /me 만 맞다
    expect(findActivePath("/me/account", patterns)).toBe("/me");
    expect(findActivePath("/me/coins/charge", patterns)).toBe("/me");
  });

  it("동적 세그먼트는 아무 값이나 받는다", () => {
    expect(findActivePath("/host/rooms/ABC123/timing", ["/host/rooms/[code]/timing"])).toBe(
      "/host/rooms/[code]/timing",
    );
  });

  it("해당하는 항목이 없으면 undefined", () => {
    expect(findActivePath("/login", patterns)).toBeUndefined();
  });
});
