/**
 * 포트원(PortOne) V2 결제창 호출 어댑터.
 *
 * **결제창은 프런트가 직접 띄운다.** 서버는 `POST /coins/charges`에서 포트원을 부르지 않고
 * 호출 파라미터(`storeId`·`channelKey`·`paymentId`·`orderName`·`amount`)만 내려준다 —
 * 그 값을 그대로 SDK에 넘긴다. 여기서 값을 지어내지 않는다.
 *
 * **결제창이 성공으로 닫혀도 이 시점엔 코인이 아직 안 늘었다.** 이어서
 * `POST /coins/charges/{chargeId}/confirm`을 불러야 서버가 포트원에 실제 상태·금액을
 * 물어보고 적립한다(클라이언트가 보낸 금액은 신뢰하지 않는다).
 *
 * 목 모드(`NEXT_PUBLIC_API_BASE_URL`이 비었을 때)는 SDK를 부르지 않고 바로 성공을 돌려준다 —
 * 목 서버에는 띄울 결제창이 없다.
 */
import PortOne from "@portone/browser-sdk/v2";
import { IS_MOCK } from "@/lib/env";
import type { CoinChargeResponse, PaymentMethod } from "@/lib/types/dto";

/** 화면이 고르는 결제 수단 키. 서버 전송값(`PaymentMethod`)과는 어댑터가 이어 준다 */
export type PayMethod = "kakaopay" | "naverpay" | "tosspay" | "card" | "transfer";

export const PAY_METHOD_LABEL: Record<PayMethod, string> = {
  kakaopay: "카카오페이",
  naverpay: "네이버페이",
  tosspay: "토스페이",
  card: "신용 · 체크카드",
  transfer: "계좌이체",
};

/**
 * 확정 응답의 서버 수단(`PaymentMethod`) → 화면 표시용 `PayMethod`.
 * 결제창 안에서 고른 **실제 수단**은 서버가 포트원 조회로 알아내 확정 응답에 실어 준다 —
 * 완료 화면은 그 값을 이 맵으로 라벨링한다.
 */
const PAY_METHOD_BY_WIRE: Record<PaymentMethod, PayMethod> = {
  KAKAOPAY: "kakaopay",
  NAVERPAY: "naverpay",
  TOSSPAY: "tosspay",
  CARD: "card",
  BANK_TRANSFER: "transfer",
};

export function payMethodFromWire(method: PaymentMethod | null | undefined): PayMethod | null {
  return method ? (PAY_METHOD_BY_WIRE[method] ?? null) : null;
}

export type PaymentResult =
  { ok: true; paymentId: string } | { ok: false; code: "CANCELLED" | "FAILED"; message: string };

/** 사용자가 스스로 창을 닫은 것인지 — 실패로 다루면 "결제 실패" 화면이 잘못 뜬다 */
function isUserCancel(code: string | undefined, message: string | undefined): boolean {
  return /CANCEL/i.test(code ?? "") || /취소/.test(message ?? "");
}

/** 결제창이 문구를 안 줬을 때의 대체 문구 */
const FALLBACK_MESSAGE = "결제를 끝내지 못했어요. 잠시 후 다시 시도해 주세요";

/**
 * 결제창이 준 문구는 `[PAY_PROCESS_CANCELED] 사용자가 결제를 취소하였습니다` 처럼
 * PG 오류 코드가 앞에 붙어 온다. 문장은 그대로 쓰되 대괄호 코드만 떼고, 원문은 콘솔에 남긴다.
 */
function failed(code: "CANCELLED" | "FAILED", raw: string | undefined): PaymentResult {
  console.warn("[portone] 결제 미완료", code, raw);
  const message = (raw ?? "").replace(/^\s*\[[A-Z0-9_]+\]\s*/, "").trim();
  return { ok: false, code, message: message || FALLBACK_MESSAGE };
}

/**
 * 결제창을 열고 결과를 돌려준다.
 *
 * @param charge `POST /coins/charges`의 응답 그대로
 * @param method 화면이 고른 결제 수단(서버 전송값). 서버가 채널을 이미 골랐으므로 구분코드만 맞춘다
 */
export async function requestPayment(charge: CoinChargeResponse): Promise<PaymentResult> {
  // 목 모드: 띄울 결제창이 없다. 서버가 준 paymentId를 그대로 돌려준다
  if (IS_MOCK) return { ok: true, paymentId: charge.paymentId };

  try {
    const response = await PortOne.requestPayment({
      storeId: charge.storeId,
      channelKey: charge.channelKey,
      paymentId: charge.paymentId,
      orderName: charge.orderName,
      totalAmount: charge.amount,
      currency: "CURRENCY_KRW",
      // 화면은 수단을 고르지 않는다 — 토스페이먼츠 일반결제창은 CARD 로 열어도
      // 간편결제(카카오·네이버·토스)까지 함께 보여주고, 무엇을 골랐는지는
      // 서버가 확정 때 포트원 조회로 기록한다(2026-09-07 실동작 확인).
      payMethod: "CARD",
    });

    // 리디렉션으로 빠지면 응답 없이 페이지가 떠난다 — 돌아온 뒤 다시 이어 붙인다
    if (!response) return failed("FAILED", "결제창 응답 없음");

    if (response.code !== undefined) {
      return failed(
        isUserCancel(response.code, response.message) ? "CANCELLED" : "FAILED",
        response.message,
      );
    }

    return { ok: true, paymentId: response.paymentId };
  } catch (error) {
    const raw = error instanceof Error ? error.message : String(error);
    return failed(isUserCancel(undefined, raw) ? "CANCELLED" : "FAILED", raw);
  }
}
