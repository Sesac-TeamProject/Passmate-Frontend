import { describe, expect, it } from "vitest";
import { getRoute, MOBILE_TABS, ROUTES } from "./routes";

describe("MOBILE_TABS", () => {
  it("앱 시안 v6의 하단 4탭과 같은 수·순서다", () => {
    expect(MOBILE_TABS.map((t) => t.label)).toEqual([
      "홈",
      "내가 만든 방",
      "참여한 방",
      "마이",
    ]);
  });

  it("모든 탭이 실재하는 라우트를 가리킨다", () => {
    for (const tab of MOBILE_TABS) {
      expect(() => getRoute(tab.path)).not.toThrow();
    }
  });

  it("탭 경로는 동적 세그먼트가 없다 — 폰 탭바는 값 없이 바로 이동한다", () => {
    for (const tab of MOBILE_TABS) {
      expect(tab.path).not.toContain("[");
    }
  });

  it("탭 경로는 사이드바가 서는 구역(member · host)에만 있다", () => {
    for (const tab of MOBILE_TABS) {
      const area = ROUTES.find((r) => r.path === tab.path)?.area;
      expect(["member", "host"]).toContain(area);
    }
  });
});
