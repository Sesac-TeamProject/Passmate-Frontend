/**
 * @draft 코인·결제·정산 — **백엔드에 컨트롤러가 없다**(실서버 404). 목에서만 돈다.
 *
 * 잔액만 예외로 실제 값이 있다: `GET /users/me`의 `coinBalance`.
 * 여기 필드는 ERD 후보값이라 스웨거가 열리면 `contracts/rest-api.md` §3-4부터 대조한다.
 */
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

/** 정산 상태 — 백엔드 `HostEarningRow.status` */
export type PayoutStatus = "PENDING" | "SETTLED" | "HELD" | "CARRIED";
/** 세션 한 건의 적립 */
export type HostEarningRow = {
  roomId: number;
  roomTitle: string;
  participantCount: number;
  /** 참가비 총액(코인, 1 C = ₩1) */
  gross: number;
  /** 플랫폼 수수료 20% */
  platformFee: number;
  /** 호스트 정산액 80% */
  net: number;
  status: PayoutStatus;
  earnedAt: string;
};

/**
 * GET /users/me/earnings — 내 수익·정산 내역.
 * **커서 페이지가 아니다** — 서버가 목록을 통째로 준다.
 */
export type EarningsResponse = {
  /** 이번 달에 적립된 정산액 합계 */
  thisMonthNet: number;
  /** 아직 지급되지 않은 정산액 합계(이월 포함) */
  pendingNet: number;
  /** 다음 지급 예정일 (YYYY-MM-DD) */
  nextPayoutDate: string;
  /** 정산 계좌를 등록했는지. false면 지급이 보류된다 */
  accountRegistered: boolean;
  /** 세션별 적립. 최근 순 */
  earnings: HostEarningRow[];
};

/** GET/PUT /users/me/settlement-account — 미등록이면 GET 404 */
export type SettlementAccountDto = {
  bankName?: string;
  accountNumber?: string;
  holderName?: string;
};
/** PUT /users/me/payment-method */
export type PaymentMethodRequest = { method: PaymentMethod };
