import { describe, expect, it } from "vitest";
import { matchMockRoute } from "./router";

describe("mocks/router", () => {
  const table = ["GET /rooms/pin/:pin", "POST /rooms/:roomId/participants", "GET /users/me"];

  it("경로 파라미터를 뽑는다", () => {
    expect(matchMockRoute(table, "POST", "/rooms/12/participants")).toEqual({
      key: "POST /rooms/:roomId/participants",
      params: { roomId: "12" },
    });
  });
  it("고정 경로는 정확히 일치해야 한다", () => {
    expect(matchMockRoute(table, "GET", "/users/me")).toEqual({ key: "GET /users/me", params: {} });
    expect(matchMockRoute(table, "GET", "/users/me/extra")).toBeNull();
    expect(matchMockRoute(table, "DELETE", "/users/me")).toBeNull();
  });
});
