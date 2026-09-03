/**
 * 코인·참가비 결제·정산 API.
 *
 * 코인·참가비는 백엔드 `coin` 도메인(PR #29~#32)에 구현돼 있다 — **전부 회원 전용**이다.
 * 주소에 prefix가 없고(`/api/v1` 금지), 값이 없는 필드는 응답에서 아예 빠진다.
 */
import type {
  CoinBalanceResponse,
  CoinChargeConfirmResponse,
  CoinChargeResponse,
  CoinTransactionPageResponse,
  CreateChargeRequest,
  EarningsResponse,
  EntryPaymentCancelResponse,
  EntryPaymentResponse,
  PaymentMethod,
  PaymentMethodRequest,
  PaymentMethodResponse,
  SettlementAccountRequest,
  SettlementAccountResponse,
} from "@/lib/types/dto";
import { downloadFile, request } from "./client";

/** GET /users/me/coins — 보유 코인·기본 결제 수단·최근 내역 1건 */
export function getCoinBalance(): Promise<CoinBalanceResponse> {
  return request<CoinBalanceResponse>("/users/me/coins");
}

/**
 * GET /users/me/coins/transactions — **오프셋 페이지**다.
 * `Pageable`이 아니라 `page`·`size`를 직접 받는다 — `sort`는 서버가 무시한다.
 */
export function getCoinTransactions(page = 0, size = 20): Promise<CoinTransactionPageResponse> {
  return request<CoinTransactionPageResponse>("/users/me/coins/transactions", {
    query: { page, size },
  });
}

/**
 * POST /coins/charges — 충전 요청. 서버는 포트원을 부르지 않고 **결제창 파라미터만** 준다.
 * `roomId`를 실으면 confirm 한 번이 충전 + 참가비 차감까지 끝낸다.
 */
export function createCharge(body: CreateChargeRequest): Promise<CoinChargeResponse> {
  return request<CoinChargeResponse>("/coins/charges", { method: "POST", body });
}

/**
 * POST /coins/charges/{chargeId}/confirm — **본문 없음**. 서버가 포트원에 실제 상태·금액을
 * 물어보고 일치할 때만 적립한다. 멱등하다 — 다시 불러도 코인은 한 번만 들어간다.
 *
 * 결제창이 닫힌 직후 곧바로 부르면 409 `PAYMENT_NOT_COMPLETED`가 날 수 있다(포트원 쪽이 아직
 * READY). 짧은 지연 후 재시도하고, 그래도면 웹훅이 뒤이어 확정하므로 코인은 유실되지 않는다.
 */
export function confirmCharge(chargeId: number): Promise<CoinChargeConfirmResponse> {
  return request<CoinChargeConfirmResponse>(`/coins/charges/${chargeId}/confirm`, {
    method: "POST",
  });
}

/**
 * POST /rooms/{roomId}/entry-payments — 참가비 코인 차감. **본문 없음**이다:
 * 금액은 방에 걸린 참가비를 서버가 읽는다. 잔액이 모자라면 402 `INSUFFICIENT_COINS`이고
 * 부족분이 `AppError.data`에 실려 온다.
 */
export function createEntryPayment(roomId: number): Promise<EntryPaymentResponse> {
  return request<EntryPaymentResponse>(`/rooms/${roomId}/entry-payments`, { method: "POST" });
}

/**
 * POST /entry-payments/{paymentId}/cancel — **세션 시작 전까지만**.
 * 차감한 코인을 전액 돌려주고 입장해 있었다면 방에서도 빠진다(현금 환불이 아니다).
 * 시작된 뒤에는 409 `REFUND_WINDOW_CLOSED`.
 */
export function cancelEntryPayment(paymentId: number): Promise<EntryPaymentCancelResponse> {
  return request<EntryPaymentCancelResponse>(`/entry-payments/${paymentId}/cancel`, {
    method: "POST",
  });
}

/** GET /users/me/earnings — 수익·정산 요약+내역 */
export function getEarnings(): Promise<EarningsResponse> {
  return request<EarningsResponse>("/users/me/earnings");
}

/**
 * GET /users/me/earnings/export — 정산 내역을 첨부 파일로 내려받는다.
 * 형식은 **서버가 CSV만 받는다** — 다른 값을 넘기면 400 `INVALID_INPUT`이다.
 */
export function exportEarnings(): Promise<void> {
  return downloadFile("/users/me/earnings/export?format=csv", "passmate-settlements.csv");
}

/**
 * GET /users/me/settlement-account.
 * **미등록도 200이다** — `registered: false`로 오고 `account`가 빠진다(404 아님).
 */
export function getSettlementAccount(): Promise<SettlementAccountResponse> {
  return request<SettlementAccountResponse>("/users/me/settlement-account");
}

/** PUT /users/me/settlement-account — 등록·변경. 번호는 마스킹하지 않은 원본을 보낸다 */
export function putSettlementAccount(
  body: SettlementAccountRequest,
): Promise<SettlementAccountResponse> {
  return request<SettlementAccountResponse>("/users/me/settlement-account", {
    method: "PUT",
    body,
  });
}

/** PUT /users/me/payment-method — 충전 화면이 미리 골라 둘 값일 뿐이다(카드 정보는 안 갖는다) */
export function putPaymentMethod(method: PaymentMethod): Promise<PaymentMethodResponse> {
  const body: PaymentMethodRequest = { method };
  return request<PaymentMethodResponse>("/users/me/payment-method", { method: "PUT", body });
}
