/**
 * 포트원(PortOne) 결제창 호출 어댑터.
 *
 * 시안(W-11 · C-02-5)의 결제창은 포트원 SDK가 띄우는 외부 UI라 코드로 그리지 않는다.
 * 지금은 `NEXT_PUBLIC_API_BASE_URL`이 비어 있는 목 모드만 있어서 SDK 없이 바로 성공을 돌려준다.
 *
 * TODO(API): 백엔드 결제 준비/검증 계약이 확정되면
 *   1) `pnpm add @portone/browser-sdk`
 *   2) `PortOne.requestPayment({ storeId, channelKey, paymentId, orderName, totalAmount, currency: "KRW", payMethod, redirectUrl })`
 *   3) 성공 시 `lib/api/payments.ts`로 서버 검증 → 코인 반영
 *   로 교체한다. env: NEXT_PUBLIC_PORTONE_STORE_ID, NEXT_PUBLIC_PORTONE_CHANNEL_KEY_*
 */

export type PayMethod = "kakaopay" | "naverpay" | "tosspay" | "card" | "transfer";

export const PAY_METHOD_LABEL: Record<PayMethod, string> = {
  kakaopay: "카카오페이",
  naverpay: "네이버페이",
  tosspay: "토스페이",
  card: "신용 · 체크카드",
  transfer: "계좌이체",
};

export type PaymentRequest = {
  /** 주문명. 예: "패스메이트 코인 10,000 C 충전" */
  orderName: string;
  /** 결제 금액(원) */
  amount: number;
  payMethod: PayMethod;
};

export type PaymentResult =
  { ok: true; paymentId: string } | { ok: false; code: "CANCELLED" | "FAILED"; message: string };

/** 결제창을 열고 결과를 돌려준다. 목 모드: 0.8초 뒤 성공. */
export async function requestPayment(req: PaymentRequest): Promise<PaymentResult> {
  await new Promise((r) => setTimeout(r, 800));
  const stamp = new Date();
  const ymd = `${stamp.getFullYear()}-${String(stamp.getMonth() + 1).padStart(2, "0")}${String(stamp.getDate()).padStart(2, "0")}`;
  void req;
  return {
    ok: true,
    paymentId: `PM-${ymd}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
  };
}
