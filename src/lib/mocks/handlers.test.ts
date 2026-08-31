import { describe, expect, it } from "vitest";
import { MOCK_ROUTES, resolveMock } from "./handlers";

const SAMPLE: Record<string, string> = {
  ":pin": "482913",
  ":roomId": "1",
  ":questionId": "1",
  ":id": "1",
  ":answerId": "1",
  ":userId": "42",
  ":chargeId": "chg-1",
};

describe("mocks/handlers", () => {
  // 세션·상태 관련 단정(WAITING 등)은 아래 "표의 모든 라우트" 스윕보다 먼저 돈다 — 스윕이
  // session/start·end 등을 모두 호출해 모듈 스코프 세션 상태(phase)를 옮겨 놓기 때문이다.
  it("GET /rooms/pin/482913 은 시연 방을 돌려준다", async () => {
    await expect(resolveMock("GET", "/rooms/pin/482913")).resolves.toMatchObject({
      roomId: 1,
      pin: "482913",
    });
  });

  it("모르는 PIN은 NotFound", async () => {
    await expect(resolveMock("GET", "/rooms/pin/000000")).rejects.toMatchObject({
      kind: "NotFound",
    });
  });

  it("WAITING 상태의 스냅샷은 NotFound(404=미시작)", async () => {
    await expect(resolveMock("GET", "/rooms/1/session")).rejects.toMatchObject({
      kind: "NotFound",
    });
  });

  // 라우트마다 지연(250ms)이 있고 /question-sets/generate는 1.5초 더 걸린다 — 기본 5초 타임아웃을 늘린다.
  const ROUTE_SWEEP_TIMEOUT_MS = 30000;

  it(
    "표의 모든 라우트가 샘플 URL로 해석된다",
    async () => {
      for (const key of MOCK_ROUTES) {
        const [method, path] = key.split(" ");
        const url =
          path.replace(/:[a-zA-Z]+/g, (m) => SAMPLE[m] ?? "1") +
          (path === "/rooms/public" ? "?sort=popular&type=all" : "");

        try {
          await resolveMock(method, url, {});
        } catch (e) {
          expect((e as { code?: string | null }).code).not.toBe("MOCK_ROUTE_MISSING");
        }
      }
    },
    ROUTE_SWEEP_TIMEOUT_MS,
  );
});
