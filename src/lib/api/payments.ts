/**
 * 코인·결제·정산 API.
 *
 * **정산(수익·계좌)은 백엔드 develop에 구현돼 있다** — `/users/me/earnings`,
 * `/users/me/settlement-account`.
 * **코인·결제는 아직 없다**(`@draft` 표시가 붙은 함수들) — 실서버 404라 화면이 "준비 중"으로 접는다.
 */
import type {
  ChargeCheckoutResponse,
  CoinBalanceResponse,
  CoinTransactionPageResponse,
  ConfirmChargeRequest,
  ConfirmChargeResponse,
  CreateChargeRequest,
  CreateEntryPaymentRequest,
  EarningsResponse,
  EntryPaymentResponse,
  PaymentMethod,
  PaymentMethodRequest,
  SettlementAccountRequest,
  SettlementAccountResponse,
} from "@/lib/types/dto";
import { downloadFile, request } from "./client";

/**
 * @draft **백엔드 미구현**(실서버 404) — 화면이 "준비 중"으로 접는다. GET /users/me/coins */
export function getCoinBalance(): Promise<CoinBalanceResponse> {
  return request<CoinBalanceResponse>("/users/me/coins");
}

/**
 * @draft **백엔드 미구현**(실서버 404) — 화면이 "준비 중"으로 접는다. GET /users/me/coins/transactions */
export function getCoinTransactions(cursor?: string): Promise<CoinTransactionPageResponse> {
  return request<CoinTransactionPageResponse>("/users/me/coins/transactions", {
    query: { cursor },
  });
}

/**
 * @draft **백엔드 미구현**(실서버 404) — 화면이 "준비 중"으로 접는다. POST /coins/charges — roomId 있으면 충전 후 바로 차감할 방 */
export function createCharge(body: CreateChargeRequest): Promise<ChargeCheckoutResponse> {
  return request<ChargeCheckoutResponse>("/coins/charges", { method: "POST", body });
}

/**
 * @draft **백엔드 미구현**(실서버 404) — 화면이 "준비 중"으로 접는다. POST /coins/charges/{chargeId}/confirm */
export function confirmCharge(
  chargeId: string,
  body: ConfirmChargeRequest,
): Promise<ConfirmChargeResponse> {
  return request<ConfirmChargeResponse>(`/coins/charges/${chargeId}/confirm`, {
    method: "POST",
    body,
  });
}

/**
 * @draft **백엔드 미구현**(실서버 404) — 화면이 "준비 중"으로 접는다. POST /rooms/{roomId}/entry-payments — 참가비 코인 차감. 402 잔액 부족 */
export function createEntryPayment(
  roomId: number,
  body: CreateEntryPaymentRequest,
): Promise<EntryPaymentResponse> {
  return request<EntryPaymentResponse>(`/rooms/${roomId}/entry-payments`, {
    method: "POST",
    body,
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

/**
 * @draft **백엔드 미구현**(실서버 404) — 화면이 "준비 중"으로 접는다. PUT /users/me/payment-method {method} */
export function putPaymentMethod(method: PaymentMethod): Promise<void> {
  const body: PaymentMethodRequest = { method };
  return request<void>("/users/me/payment-method", { method: "PUT", body });
}
