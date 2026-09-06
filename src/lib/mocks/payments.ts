import { AppError } from "@/lib/types/app-error";
import type {
  CoinBalanceResponse,
  CoinChargeConfirmResponse,
  CoinChargeResponse,
  CoinTransactionPageResponse,
  CoinTransactionRow,
  CreateChargeRequest,
  EarningsResponse,
  EntryPaymentCancelResponse,
  EntryPaymentResponse,
  PaymentMethodResponse,
  SettlementAccountRequest,
  SettlementAccountResponse,
  SettlementAccountView,
  PaymentMethodRequest,
  HostEarningRow,
} from "@/lib/types/dto";
import { ERROR_CODES } from "@/lib/types/error-codes";
import { DEMO_ROOM } from "./fixtures";

/**
 * 코인·참가비·정산(payments) 목 응답. 백엔드 `coin` 도메인(PR #29~#32)을 거울로 삼는다.
 * 잔액·영수증·충전 건은 모듈 스코프에서 유지해 화면이 여러 번 불러도 앞뒤가 맞게 한다.
 */

let balance = 12000;

/** 원장. 최근 순으로 준다 — `balanceAfter`는 그 건을 적용한 뒤의 잔액이다 */
const COIN_HISTORY: CoinTransactionRow[] = [
  {
    id: 91,
    type: "ENTRY",
    amount: -3000,
    balanceAfter: 12000,
    refType: "ENTRY_PAYMENT",
    refId: 44,
    description: "CS 면접 스터디 · PM-2026-0903-0417",
    createdAt: "2026-09-03T14:02:11",
  },
  {
    id: 90,
    type: "CHARGE",
    amount: 10000,
    balanceAfter: 15000,
    refType: "COIN_CHARGE",
    refId: 77,
    description: "패스메이트 코인 10,000 C 충전",
    createdAt: "2026-09-03T13:58:40",
  },
  {
    id: 89,
    type: "REFUND",
    amount: 3000,
    balanceAfter: 5000,
    refType: "ENTRY_PAYMENT",
    refId: 41,
    description: "Spring 실전 모의고사 · PM-2026-0828-0311 취소",
    createdAt: "2026-08-28T09:14:02",
  },
  {
    id: 88,
    type: "AI_ANALYSIS",
    amount: -500,
    balanceAfter: 2000,
    refType: "AI_FEEDBACK",
    refId: 12,
    description: "서술형 AI 분석",
    createdAt: "2026-08-24T20:31:55",
  },
  {
    id: 87,
    type: "ADMIN_ADJUST",
    amount: 2500,
    balanceAfter: 2500,
    createdAt: "2026-08-01T10:00:00",
  },
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

let chargeCounter = 76;
let paymentCounter = 43;
let transactionId = 91;

/** 발급한 충전 건. confirm이 본문 없이 오므로 roomId도 여기 들고 있는다(서버와 같다) */
type MockCharge = {
  amount: number;
  roomId?: number;
  status: "READY" | "PAID";
  balanceAfter: number;
};
const charges = new Map<number, MockCharge>();
/** 발급한 참가비 영수증. 취소가 paymentId만 들고 오므로 서버처럼 여기서 찾는다 */
const entryPayments = new Map<number, EntryPaymentResponse>();

/** 서버와 같은 오프셋 없는 ISO-8601 로컬 시각 문자열 */
function now(): string {
  return new Date().toISOString().slice(0, 19);
}

/** 영수증 번호 PM-YYYY-MMDD-NNNN */
function nextPaymentNo(seq: number): string {
  const at = new Date();
  const mmdd = `${String(at.getMonth() + 1).padStart(2, "0")}${String(at.getDate()).padStart(2, "0")}`;
  return `PM-${at.getFullYear()}-${mmdd}-${String(seq).padStart(4, "0")}`;
}

/** 원장에 한 줄 남긴다 — 화면이 충전 직후 내역을 열어도 앞뒤가 맞는다 */
function pushTransaction(row: Omit<CoinTransactionRow, "id" | "createdAt">): void {
  transactionId += 1;
  COIN_HISTORY.unshift({ ...row, id: transactionId, createdAt: now() });
}

/** GET /users/me/coins */
export function mockCoinBalance(): CoinBalanceResponse {
  const lastTransaction = COIN_HISTORY[0];
  return {
    balance,
    defaultPaymentMethod: "KAKAOPAY",
    ...(lastTransaction ? { lastTransaction } : {}),
  };
}

/** GET /users/me/coins/transactions?page&size — 오프셋 페이지. `sort`는 서버가 무시한다 */
export function mockCoinTransactions(url: URL): CoinTransactionPageResponse {
  const page = Number(url.searchParams.get("page") ?? 0) || 0;
  const size = Number(url.searchParams.get("size") ?? 20) || 20;

  return {
    content: COIN_HISTORY.slice(page * size, page * size + size),
    page,
    size,
    totalElements: COIN_HISTORY.length,
    totalPages: Math.max(1, Math.ceil(COIN_HISTORY.length / size)),
    hasNext: (page + 1) * size < COIN_HISTORY.length,
  };
}

const AMOUNT_LOCALE = "ko-KR";

/**
 * POST /coins/charges — 결제창 파라미터만 준다. **이 단계에서는 코인이 늘지 않는다**(READY).
 * 라우트 스윕이 `{}`처럼 계약에 맞지 않는 바디로도 부르므로 amount는 방어적으로 기본값을 둔다.
 */
export function mockCreateCharge(body: CreateChargeRequest): CoinChargeResponse {
  const amount = body.amount ?? 0;
  chargeCounter += 1;
  charges.set(chargeCounter, {
    amount,
    ...(body.roomId != null ? { roomId: body.roomId } : {}),
    status: "READY",
    balanceAfter: balance,
  });

  return {
    chargeId: chargeCounter,
    paymentId: `pm-charge-${chargeCounter}`,
    storeId: "store-mock",
    channelKey: "channel-key-mock",
    amount,
    orderName: `패스메이트 코인 ${amount.toLocaleString(AMOUNT_LOCALE)} C 충전`,
    status: "READY",
  };
}

/**
 * POST /coins/charges/{chargeId}/confirm — 본문 없다. **멱등하다**:
 * 이미 확정된 건에 다시 불러도 200이고 코인은 한 번만 들어간다.
 */
export function mockConfirmCharge(chargeId: number): CoinChargeConfirmResponse {
  const charge = charges.get(chargeId);
  if (!charge) throw new AppError("NotFound", { code: ERROR_CODES.NOT_FOUND, status: 404 });

  if (charge.status === "PAID") {
    return { chargeId, status: "PAID", amount: charge.amount, balanceAfter: charge.balanceAfter };
  }

  balance += charge.amount;
  pushTransaction({
    type: "CHARGE",
    amount: charge.amount,
    balanceAfter: balance,
    refType: "COIN_CHARGE",
    refId: chargeId,
    description: `패스메이트 코인 ${charge.amount.toLocaleString(AMOUNT_LOCALE)} C 충전`,
  });

  // roomId를 실어 보냈으면 참가비 차감까지 여기서 끝난다 — 참가비 API를 따로 부르지 않는다
  const entryPayment = charge.roomId != null ? mockEntryPayment(charge.roomId) : undefined;

  charge.status = "PAID";
  charge.balanceAfter = balance;

  return {
    chargeId,
    status: "PAID",
    amount: charge.amount,
    balanceAfter: balance,
    paidAt: now(),
    ...(entryPayment ? { entryPayment } : {}),
  };
}

/**
 * POST /rooms/{roomId}/entry-payments — 본문 없다. 금액은 방에 걸린 참가비를 서버가 읽는다.
 * 잔액이 모자라면 402에 부족분을 실어 준다 — 화면이 잔액을 다시 조회하지 않게.
 *
 * `force`는 목 전용 탈출구다(계약 테스트가 잔액을 끌어내릴 때만 쓴다).
 */
export function mockEntryPayment(
  roomId: number,
  options: { force?: boolean } = {},
): EntryPaymentResponse {
  const fee = DEMO_ROOM.fee ?? 0;

  if (!options.force && balance < fee) {
    throw new AppError("PaymentRequired", {
      code: ERROR_CODES.INSUFFICIENT_COINS,
      status: 402,
      serverMessage: "코인이 부족합니다.",
      data: { required: fee, balance, shortfall: fee - balance },
    });
  }

  paymentCounter += 1;
  balance -= fee;

  const receipt: EntryPaymentResponse = {
    paymentId: paymentCounter,
    paymentNo: nextPaymentNo(paymentCounter),
    roomId,
    amount: fee,
    status: "PAID",
    balanceAfter: balance,
    paidAt: now(),
  };
  entryPayments.set(receipt.paymentId, receipt);
  pushTransaction({
    type: "ENTRY",
    amount: -fee,
    balanceAfter: balance,
    refType: "ENTRY_PAYMENT",
    refId: receipt.paymentId,
    description: `${DEMO_ROOM.title} · ${receipt.paymentNo}`,
  });

  return receipt;
}

/** POST /entry-payments/{paymentId}/cancel — 코인으로 전액 돌려준다(현금 환불이 아니다) */
export function mockCancelEntryPayment(paymentId: number): EntryPaymentCancelResponse {
  const receipt = entryPayments.get(paymentId);
  if (!receipt) throw new AppError("NotFound", { code: ERROR_CODES.NOT_FOUND, status: 404 });
  if (receipt.status === "REFUNDED") {
    throw new AppError("Conflict", { code: ERROR_CODES.ALREADY_REFUNDED, status: 409 });
  }

  balance += receipt.amount;
  receipt.status = "REFUNDED";
  pushTransaction({
    type: "REFUND",
    amount: receipt.amount,
    balanceAfter: balance,
    refType: "ENTRY_PAYMENT",
    refId: receipt.paymentId,
    description: `${DEMO_ROOM.title} · ${receipt.paymentNo} 취소`,
  });

  return {
    paymentId: receipt.paymentId,
    paymentNo: receipt.paymentNo,
    roomId: receipt.roomId,
    status: "REFUNDED",
    refundedAmount: receipt.amount,
    balanceAfter: balance,
    refundedAt: now(),
  };
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

/** PUT /users/me/payment-method — 고른 값을 그대로 돌려준다(카드 정보는 갖지 않는다) */
export function mockPutPaymentMethod(body: PaymentMethodRequest): PaymentMethodResponse {
  return { defaultPaymentMethod: body?.method ?? "KAKAOPAY" };
}
