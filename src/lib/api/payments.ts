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
  SettlementAccountDto,
} from "@/lib/types/dto";
import { request } from "./client";

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

/** GET /users/me/settlement-account (404=미등록) */
export function getSettlementAccount(): Promise<SettlementAccountDto> {
  return request<SettlementAccountDto>("/users/me/settlement-account");
}

/** PUT /users/me/settlement-account */
export function putSettlementAccount(body: SettlementAccountDto): Promise<void> {
  return request<void>("/users/me/settlement-account", { method: "PUT", body });
}

/**
 * @draft **백엔드 미구현**(실서버 404) — 화면이 "준비 중"으로 접는다. PUT /users/me/payment-method {method} */
export function putPaymentMethod(method: PaymentMethod): Promise<void> {
  const body: PaymentMethodRequest = { method };
  return request<void>("/users/me/payment-method", { method: "PUT", body });
}
