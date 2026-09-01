import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/types/app-error";
import { MOCK_ROUTES, resolveMock } from "./handlers";
import { __resetSessionForTests } from "./session";

const SAMPLE: Record<string, string> = {
  ":pin": "482913",
  ":roomId": "1",
  ":questionId": "1",
  ":id": "1",
  ":setId": "1",
  ":answerId": "1",
  ":userId": "42",
  ":chargeId": "chg-1",
};

// 라우트마다 지연(250ms)이 있고 /question-sets/:setId/questions/generate는 1.5초 더 걸린다 — 기본 5초 타임아웃을 늘린다.
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

  it(
    "네트워크를 타는 api 함수 전부가 목 라우트를 갖는다",
    async () => {
      vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
      vi.resetModules();

      const [rooms, sessions, qs, results, me, payments, ratings, auth] = await Promise.all([
        import("@/lib/api/rooms"),
        import("@/lib/api/sessions"),
        import("@/lib/api/question-sets"),
        import("@/lib/api/results"),
        import("@/lib/api/me"),
        import("@/lib/api/payments"),
        import("@/lib/api/ratings"),
        import("@/lib/api/auth"),
      ]);
      // generateQuestionSet은 목 지연이 1.5초 더 걸려 맨 끝에 둔다(ROUTE_SWEEP_TIMEOUT_MS로 흡수).
      const calls: (() => Promise<unknown>)[] = [
        () => rooms.getRoomByPin("482913"),
        () => rooms.createRoom({ title: "t" }),
        () => rooms.getHostedRooms(),
        () => rooms.getPublicRooms({ sort: "popular", type: "all" }),
        () => rooms.joinRoom(1, { nickname: "n" }),
        () => rooms.getParticipants(1),
        () => rooms.leaveRoom(1),
        () => sessions.startSession(1),
        () => sessions.getSessionSnapshot(1),
        () => sessions.nextQuestion(1),
        () => sessions.endCurrentQuestion(1),
        () => sessions.endSession(1),
        () => sessions.lockScreen(1, true),
        () => sessions.getSubmissions(1),
        () => sessions.submitAnswer(1, 1, "A"),
        () => sessions.getVoiceHints(1),
        () => sessions.uploadVoiceHint(1, new Blob(["x"], { type: "audio/webm" }), 1200),
        () => qs.getQuestionSets(),
        () => qs.getQuestionSet(1),
        () => qs.updateQuestionSet(1, { title: "t" }),
        () => qs.confirmQuestionSet(1),
        () => qs.duplicateQuestionSet(1),
        () => qs.createQuestionSet({ title: "t" }),
        () => qs.generateFromFile(1, new File(["x"], "a.pdf", { type: "application/pdf" })),
        () => results.getMyResult(1),
        () => results.getMyReport(1),
        () => results.getRoomReport(1),
        () => results.getEssayAnswers(1, 1),
        () => results.postHostReview(1, { comment: "c" }),
        () => me.updateProfile({ nickname: "n" }),
        () => me.getMyPage(),
        () => me.getGrade(),
        () => me.getBadges(),
        () => me.getNotificationSettings(),
        () => me.putNotificationSettings({ sessionStart: true }),
        () => me.getHostProfile(42),
        () => me.postReport({ targetType: "USER", targetId: 42, reason: "SPAM" }),
        () => me.claimGuestRecord(11),
        () => payments.getCoinBalance(),
        () => payments.getCoinTransactions(),
        () => payments.createCharge({ amount: 10000, method: "KAKAO_PAY" }),
        () => payments.confirmCharge("chg-1", { paymentId: "p" }),
        () => payments.createEntryPayment(1, { nickname: "n" }),
        () => payments.getEarnings(),
        () => payments.getSettlementAccount(),
        () =>
          payments.putSettlementAccount({
            bankName: "국민",
            accountNumber: "1",
            holderName: "h",
          }),
        () => payments.putPaymentMethod("CARD"),
        () => ratings.submitRating(1, { stars: 5, tags: [] }),
        () => auth.getMe(),
        () => auth.logout(),
        () => me.deleteMe(),
        () =>
          qs.generateQuestionSet(1, {
            topic: "Spring",
            counts: [{ type: "MULTIPLE_CHOICE", count: 1 }],
            difficulty: "MEDIUM",
          }),
      ];

      for (const call of calls) {
        try {
          await call();
        } catch (e) {
          expect(AppError.isAppError(e)).toBe(true);
          expect((e as { code?: string | null }).code).not.toBe("MOCK_ROUTE_MISSING");
        }
      }

      vi.unstubAllEnvs();
    },
    ROUTE_SWEEP_TIMEOUT_MS,
  );
});
