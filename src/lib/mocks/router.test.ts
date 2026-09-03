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

  /**
   * `/rooms/public`(고정)과 `/rooms/:roomId`(파라미터)가 함께 있는 실제 표의 상황.
   * 표 순서에 기대면 라우트를 추가하는 위치만으로 공개 방 목록이 방 상세로 새어 나간다.
   */
  it("고정 세그먼트가 파라미터보다 먼저 이긴다 — 표 순서와 무관하게", () => {
    const ambiguous = ["GET /rooms/:roomId", "GET /rooms/public"];

    expect(matchMockRoute(ambiguous, "GET", "/rooms/public")).toEqual({
      key: "GET /rooms/public",
      params: {},
    });
    expect(matchMockRoute(ambiguous, "GET", "/rooms/12")).toEqual({
      key: "GET /rooms/:roomId",
      params: { roomId: "12" },
    });
  });

  it("파라미터가 적은 쪽을 고른다", () => {
    const table2 = ["GET /rooms/:roomId/:section", "GET /rooms/:roomId/participants"];

    expect(matchMockRoute(table2, "GET", "/rooms/1/participants")).toEqual({
      key: "GET /rooms/:roomId/participants",
      params: { roomId: "1" },
    });
  });
});
