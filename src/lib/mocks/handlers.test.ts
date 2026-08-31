import { beforeEach, describe, expect, it } from "vitest";
import { AppError } from "@/lib/types/app-error";
import { MOCK_ROUTES, resolveMock } from "./handlers";
import { __resetSessionForTests } from "./session";

const SAMPLE: Record<string, string> = {
  ":pin": "482913",
  ":roomId": "1",
  ":questionId": "1",
  ":id": "1",
  ":answerId": "1",
  ":userId": "42",
  ":chargeId": "chg-1",
};

// 라우트마다 지연(250ms)이 있고 /question-sets/generate는 1.5초 더 걸린다 — 기본 5초 타임아웃을 늘린다.
const ROUTE_SWEEP_TIMEOUT_MS = 30000;

describe("mocks/handlers", () => {
  // session.ts의 phase 등은 모듈 스코프 상태라 테스트 간에 남는다 — 매 테스트 전에 되돌린다.
  beforeEach(() => {
    __resetSessionForTests();
  });

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
          // 라우트가 없어서 실패한 게 아니라면(MOCK_ROUTE_MISSING), 목 구현이 던지는 모든 실패는
          // AppError여야 한다 — 계약에 맞지 않는 바디(`{}`)에서 raw TypeError가 새어 나오면 안 된다.
          expect(AppError.isAppError(e)).toBe(true);
          expect((e as { code?: string | null }).code).not.toBe("MOCK_ROUTE_MISSING");
        }
      }
    },
    ROUTE_SWEEP_TIMEOUT_MS,
  );

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

  it("계약에 맞지 않는 바디로 코인 충전을 요청해도 AppError 대신 결제창 파라미터를 돌려준다", async () => {
    await expect(resolveMock("POST", "/coins/charges", {})).resolves.toMatchObject({
      chargeId: expect.any(String),
      storeId: "store-mock",
      amount: 0,
    });
  });
});
