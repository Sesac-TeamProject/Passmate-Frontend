import { describe, expect, it } from "vitest";
import {
  mockCancelEntryPayment,
  mockCoinBalance,
  mockCoinTransactions,
  mockConfirmCharge,
  mockCreateCharge,
  mockEntryPayment,
} from "@/lib/mocks/payments";
import { DEMO_ROOM } from "@/lib/mocks/fixtures";
import { AppError } from "@/lib/types/app-error";
import { expectContract } from "./expect-contract";

/**
 * 백엔드 `coin/dto` · `room/dto` (develop @ 9e39ce3, PR #29~#32)와 1:1인지 고정한다.
 *
 * 이 도메인은 오래 `@draft`로 두었던 자리라 옛 모양이 곳곳에 남아 있었다.
 * **조용히 틀리는 것들**을 붙잡아 둔다: 결제 수단 값의 언더스코어 · 커서 페이지 ·
 * `chargeId`의 타입 · confirm과 참가비의 요청 본문 · 402가 실어 주는 부족분.
 */
describe("코인·참가비 결제 계약", () => {
  it("잔액은 기본 결제 수단과 최근 내역 1건을 함께 준다", () => {
    const wallet = mockCoinBalance();

    expectContract(wallet, ["balance"], ["defaultPaymentMethod", "lastTransaction"]);
    // 옛 이름(defaultMethod·recent)으로 읽으면 값이 통째로 빈다
    expect(wallet).not.toHaveProperty("defaultMethod");
    expect(wallet).not.toHaveProperty("recent");
  });

  it("결제 수단 값에는 언더스코어가 없다 — KAKAO_PAY로 보내면 400이다", () => {
    expect(mockCoinBalance().defaultPaymentMethod).toBe("KAKAOPAY");
  });

  it("코인 내역은 커서가 아니라 오프셋 페이지다", () => {
    const page = mockCoinTransactions(new URL("http://x/users/me/coins/transactions"));

    expectContract(page, ["content", "page", "size", "totalElements", "totalPages", "hasNext"]);
    expect(page).not.toHaveProperty("items");
    expect(page).not.toHaveProperty("nextCursor");
  });

  it("내역 한 줄은 방 제목이 아니라 description·refType으로 영수증을 가리킨다", () => {
    const row = mockCoinTransactions(new URL("http://x/users/me/coins/transactions")).content[0];

    expectContract(
      row,
      ["id", "type", "amount", "balanceAfter", "createdAt"],
      ["refType", "refId", "description"],
    );
    expect(row).not.toHaveProperty("roomTitle");
    expect(row).not.toHaveProperty("method");
    expect(row).not.toHaveProperty("paymentNo");
  });

  it("참가비 차감의 원장 종류는 DEDUCT가 아니라 ENTRY다", () => {
    const rows = mockCoinTransactions(new URL("http://x/users/me/coins/transactions")).content;

    expect(rows.map((row) => row.type)).toContain("ENTRY");
    expect(rows.map((row) => row.type)).not.toContain("DEDUCT");
  });

  it("충전 준비는 결제창 파라미터만 준다 — chargeId는 숫자이고 코인은 아직 안 늘었다", () => {
    const charge = mockCreateCharge({ amount: 10000 });

    expectContract(charge, [
      "chargeId",
      "paymentId",
      "storeId",
      "channelKey",
      "amount",
      "orderName",
      "status",
    ]);
    expect(typeof charge.chargeId).toBe("number");
    expect(charge.status).toBe("READY");
    // 서버가 주지 않는 값이다 — SDK 호출에 필요한 값은 화면이 채운다
    expect(charge).not.toHaveProperty("currency");
    expect(charge).not.toHaveProperty("payMethod");
  });

  it("confirm은 본문 없이 chargeId만으로 적립하고 잔액을 balanceAfter로 준다", () => {
    const before = mockCoinBalance().balance;
    const charge = mockCreateCharge({ amount: 10000 });
    const confirmed = mockConfirmCharge(charge.chargeId);

    expectContract(
      confirmed,
      ["chargeId", "status", "amount", "balanceAfter"],
      ["paidAt", "entryPayment"],
    );
    expect(confirmed.status).toBe("PAID");
    expect(confirmed.balanceAfter).toBe(before + 10000);
    expect(confirmed).not.toHaveProperty("balance");
  });

  it("이미 확정된 건을 다시 confirm해도 오류가 아니고 코인은 한 번만 들어간다", () => {
    const charge = mockCreateCharge({ amount: 5000 });
    const first = mockConfirmCharge(charge.chargeId);
    const again = mockConfirmCharge(charge.chargeId);

    expect(again.status).toBe("PAID");
    expect(again.balanceAfter).toBe(first.balanceAfter);
  });

  it("충전에 roomId를 실으면 confirm 하나가 참가비까지 끝낸다", () => {
    const charge = mockCreateCharge({ amount: 10000, roomId: 1 });
    const confirmed = mockConfirmCharge(charge.chargeId);

    expect(confirmed.entryPayment).toBeDefined();
    expect(confirmed.entryPayment?.roomId).toBe(1);
    // 충전·차감이 모두 반영된 잔액이 하나로 온다
    expect(confirmed.balanceAfter).toBe(confirmed.entryPayment?.balanceAfter);
  });

  it("참가비는 본문 없이 방 번호로만 결제하고 영수증 번호를 준다", () => {
    const receipt = mockEntryPayment(1);

    expectContract(receipt, [
      "paymentId",
      "paymentNo",
      "roomId",
      "amount",
      "status",
      "balanceAfter",
      "paidAt",
    ]);
    expect(receipt.status).toBe("PAID");
    expect(receipt.paymentNo).toMatch(/^PM-\d{4}-\d{4}-\d{4}$/);
    expect(receipt).not.toHaveProperty("balance");
  });

  it("잔액이 모자라면 402가 부족분을 실어 준다 — 잔액을 다시 조회하지 않는다", () => {
    // 참가비를 못 낼 만큼만 끌어내린다 — 잔액은 음수가 되지 않는다
    while (mockCoinBalance().balance >= (DEMO_ROOM.fee ?? 0)) mockEntryPayment(1, { force: true });

    let thrown: unknown;
    try {
      mockEntryPayment(1);
    } catch (error) {
      thrown = error;
    }

    expect(AppError.isAppError(thrown)).toBe(true);
    const error = thrown as AppError;
    expect(error.code).toBe("INSUFFICIENT_COINS");
    expect(error.status).toBe(402);
    expectContract(error.data as object, ["required", "balance", "shortfall"]);
  });

  it("참가비 취소는 전액을 코인으로 돌려준다 — 현금 환불이 아니다", () => {
    mockConfirmCharge(mockCreateCharge({ amount: 10000 }).chargeId);
    const receipt = mockEntryPayment(1);
    const refund = mockCancelEntryPayment(receipt.paymentId);

    expectContract(
      refund,
      ["paymentId", "paymentNo", "roomId", "status", "refundedAmount", "balanceAfter"],
      ["refundedAt"],
    );
    expect(refund.status).toBe("REFUNDED");
    expect(refund.refundedAmount).toBe(receipt.amount);
    expect(refund.balanceAfter).toBe(receipt.balanceAfter + receipt.amount);
  });

  it("이미 취소한 결제를 또 취소하면 409다", () => {
    mockConfirmCharge(mockCreateCharge({ amount: 10000 }).chargeId);
    const receipt = mockEntryPayment(1);
    mockCancelEntryPayment(receipt.paymentId);

    expect(() => mockCancelEntryPayment(receipt.paymentId)).toThrowError(
      expect.objectContaining({ kind: "Conflict", code: "ALREADY_REFUNDED" }),
    );
  });
});
