import type { AvatarKey } from "./common";
import type { CursorPage, PaymentMethod } from "./common";

export type CoinTransactionType = "CHARGE" | "DEDUCT" | "REFUND";
/** amount는 부호 포함(충전·환급 +, 차감 −) */
export type CoinTransactionDto = {
  id?: number;
  type?: CoinTransactionType | null;
  amount?: number;
  balanceAfter?: number;
  method?: PaymentMethod | null;
  roomTitle?: string | null;
  paymentNo?: string | null;
  createdAt?: string | null;
};
/** GET /users/me/coins */
export type CoinBalanceResponse = {
  balance?: number;
  defaultMethod?: PaymentMethod | null;
  recent?: CoinTransactionDto | null;
};
/** GET /users/me/coins/transactions */
export type CoinTransactionPageResponse = CursorPage<CoinTransactionDto>;

/** POST /coins/charges — roomId 있으면 충전 후 바로 차감할 방 */
export type CreateChargeRequest = { amount: number; method: PaymentMethod; roomId?: number | null };
/** 포트원 V2 결제창 파라미터 — PortOne.requestPayment에 그대로(amount→totalAmount) */
export type ChargeCheckoutResponse = {
  chargeId?: string;
  storeId?: string;
  channelKey?: string;
  paymentId?: string;
  orderName?: string;
  amount?: number;
  currency?: string;
  payMethod?: string;
};
/** POST /coins/charges/{chargeId}/confirm */
export type ConfirmChargeRequest = { paymentId: string; roomId?: number | null };
export type ConfirmChargeResponse = {
  balance?: number;
  entryPayment?: EntryPaymentResponse | null;
};

/** POST /rooms/{roomId}/entry-payments — 참가비 코인 차감. 402 잔액 부족 */
export type CreateEntryPaymentRequest = { nickname: string; avatarId?: AvatarKey | null };
export type EntryPaymentResponse = { paymentNo?: string; balance?: number };

export type PayoutStatus = "SCHEDULED" | "PAID" | "HELD";
export type SettlementItemDto = {
  settlementId?: number;
  dateLabel?: string;
  roomTitle?: string;
  participantCount?: number;
  entryFeeTotal?: number;
  feeAmount?: number;
  payoutAmount?: number;
  status?: PayoutStatus | null;
};
export type EarningsNextPayout = { dateLabel?: string; amount?: number };
export type EarningsAccount = {
  bankName?: string;
  maskedNumber?: string;
  payoutNote?: string | null;
};
/** GET /users/me/earnings — 수익·정산 요약+내역 */
export type EarningsResponse = CursorPage<SettlementItemDto> & {
  monthlyTotal?: number;
  hostSharePercent?: number;
  nextPayout?: EarningsNextPayout | null;
  paidRoomCount?: number;
  studentCount?: number;
  account?: EarningsAccount | null;
};

/** GET/PUT /users/me/settlement-account — 미등록이면 GET 404 */
export type SettlementAccountDto = {
  bankName?: string;
  accountNumber?: string;
  holderName?: string;
};
/** PUT /users/me/payment-method */
export type PaymentMethodRequest = { method: PaymentMethod };
