import { AppError } from "@/lib/types/app-error";
import type {
  ChargeCheckoutResponse,
  CoinBalanceResponse,
  CoinTransactionDto,
  CoinTransactionPageResponse,
  ConfirmChargeRequest,
  ConfirmChargeResponse,
  CreateChargeRequest,
  EarningsResponse,
  EntryPaymentResponse,
  SettlementAccountRequest,
  SettlementAccountResponse,
  SettlementAccountView,
  HostEarningRow,
} from "@/lib/types/dto";
import { DEMO_ROOM } from "./fixtures";

/**
 * 코인·정산(payments) 목 응답. features/me/coins/mock.ts·features/me/settlement/mock.ts·
 * features/me/mock.ts를 DTO 모양으로 옮긴다. 잔액은 모듈 스코프에서 유지한다.
 */

let balance = 1200;

/** features/me/coins/mock.ts COIN_HISTORY — 합계 1,200 C(잔액과 일치). balanceAfter는 시간순 누적. */
const COIN_HISTORY: CoinTransactionDto[] = [
  {
    id: 1,
    type: "DEDUCT",
    amount: -10000,
    balanceAfter: 1200,
    roomTitle: "Spring 실전 모의고사",
    createdAt: "2026-08-22",
  },
  {
    id: 2,
    type: "CHARGE",
    amount: 10000,
    balanceAfter: 11200,
    method: "KAKAO_PAY",
    createdAt: "2026-08-20",
  },
  {
    id: 3,
    type: "DEDUCT",
    amount: -5000,
    balanceAfter: 1200,
    roomTitle: "CS 기술면접 라운드 2",
    createdAt: "2026-08-15",
  },
  {
    id: 4,
    type: "CHARGE",
    amount: 5000,
    balanceAfter: 6200,
    method: "KAKAO_PAY",
    createdAt: "2026-08-10",
  },
  { id: 5, type: "CHARGE", amount: 1200, balanceAfter: 1200, createdAt: "2026-08-01" },
];

/** 세션별 적립 — 백엔드 `HostEarningRow` 1:1. 최근 순 */
const SETTLEMENT_ITEMS: HostEarningRow[] = [
  {
    roomId: 101,
    roomTitle: "8월 4주차 Spring 스터디",
    participantCount: 6,
    gross: 60000,
    platformFee: 12000,
    net: 48000,
    status: "PENDING",
    earnedAt: "2026-08-22T11:00:00",
  },
  {
    roomId: 102,
    roomTitle: "CS 모의면접 3회차",
    participantCount: 5,
    gross: 50000,
    platformFee: 10000,
    net: 40000,
    status: "SETTLED",
    earnedAt: "2026-08-20T11:00:00",
  },
];

/** 조회는 마스킹된 번호만 준다 — 원본은 서버 밖으로 나오지 않는다 */
let settlementAccount: SettlementAccountView = {
  bankCode: "004",
  bankName: "국민은행",
  accountNoMasked: "********4567",
  holderName: "이한결",
  verified: true,
  verifiedAt: "2026-08-01T09:00:00",
  updatedAt: "2026-08-01T09:00:00",
};

let chargeCounter = 1;
const pendingCharges = new Map<string, number>();

/** GET /users/me/coins */
export function mockCoinBalance(): CoinBalanceResponse {
  return { balance, defaultMethod: "KAKAO_PAY", recent: COIN_HISTORY[0] ?? null };
}

/** GET /users/me/coins/transactions */
export function mockCoinTransactions(): CoinTransactionPageResponse {
  return { items: COIN_HISTORY, nextCursor: null, hasNext: false };
}

const AMOUNT_LOCALE = "ko-KR";

/**
 * POST /coins/charges — roomId 있으면 충전 후 바로 차감할 방. 포트원 V2 결제창 파라미터를 돌려준다.
 * 라우트 스윕이 `{}`처럼 계약에 맞지 않는 바디로도 호출하므로 amount는 방어적으로 기본값을 둔다
 * (원본 버그: `body.amount`가 없으면 `.toLocaleString()`에서 raw TypeError가 났다).
 */
export function mockCreateCharge(body: CreateChargeRequest): ChargeCheckoutResponse {
  const amount = body.amount ?? 0;
  const chargeId = `chg-${chargeCounter}`;
  const paymentId = `PM-${chargeCounter}`;
  chargeCounter += 1;
  pendingCharges.set(chargeId, amount);

  return {
    chargeId,
    storeId: "store-mock",
    channelKey: "channel-mock",
    paymentId,
    orderName: `패스메이트 코인 ${amount.toLocaleString(AMOUNT_LOCALE)} C 충전`,
    amount,
    currency: "KRW",
    payMethod: body.method,
  };
}

/** POST /coins/charges/{chargeId}/confirm */
export function mockConfirmCharge(
  chargeId: string,
  body: ConfirmChargeRequest,
): ConfirmChargeResponse {
  const amount = pendingCharges.get(chargeId) ?? 0;
  pendingCharges.delete(chargeId);
  balance += amount;

  let entryPayment: EntryPaymentResponse | null = null;
  if (body.roomId != null) {
    balance -= DEMO_ROOM.fee ?? 0;
    entryPayment = { paymentNo: `PM-ENTRY-${chargeCounter++}`, balance };
  }

  return { balance, entryPayment };
}

/** POST /rooms/{roomId}/entry-payments — 참가비 코인 차감. 402 잔액 부족 */
export function mockEntryPayment(): EntryPaymentResponse {
  const entryFee = DEMO_ROOM.fee ?? 0;
  if (balance < entryFee) {
    throw new AppError("PaymentRequired", { code: "INSUFFICIENT_COINS" });
  }
  balance -= entryFee;
  return { paymentNo: `PM-ENTRY-${chargeCounter++}`, balance };
}

/** GET /users/me/earnings — 수익·정산 요약+내역. features/me/settlement/mock.ts SETTLEMENT_STATS */
export function mockEarnings(): EarningsResponse {
  return {
    thisMonthNet: 384000,
    pendingNet: 307200,
    nextPayoutDate: "2026-09-05",
    accountRegistered: true,
    earnings: SETTLEMENT_ITEMS,
  };
}

/** GET /users/me/earnings/export — 목은 파일을 만들지 않는다(다운로드는 실서버에서 확인한다) */
export function mockExportEarnings(): undefined {
  return undefined;
}

/** GET /users/me/settlement-account — 미등록도 200이다(목에서는 항상 등록됨) */
export function mockSettlementAccount(): SettlementAccountResponse {
  return { registered: true, account: settlementAccount };
}

/** PUT /users/me/settlement-account — 계좌를 바꾸면 실명 확인이 다시 false가 된다 */
export function mockPutSettlementAccount(
  body: SettlementAccountRequest,
): SettlementAccountResponse {
  // 라우트 스윕이 계약에 맞지 않는 `{}`로도 부르므로 필드가 없을 때를 견딘다
  const digits = (body.accountNo ?? "").replace(/\D/g, "");

  settlementAccount = {
    bankCode: body.bankCode ?? "",
    bankName: body.bankName ?? "",
    accountNoMasked: `********${digits.slice(-4)}`,
    holderName: body.holderName ?? "",
    verified: false,
    updatedAt: new Date().toISOString().slice(0, 19),
  };
  return { registered: true, account: settlementAccount };
}

/** PUT /users/me/payment-method */
export function mockPutPaymentMethod(): undefined {
  return undefined;
}
