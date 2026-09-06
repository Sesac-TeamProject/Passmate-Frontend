/**
 * 코인·참가비 결제 — 백엔드 `coin/dto` (develop @ 9e39ce3, PR #29~#32).
 * **1 C = ₩1**이고 소수점이 없다. 참가비는 현금이 아니라 코인 차감이라
 * 취소해도 코인으로 돌아온다(현금 환불이 아니다).
 *
 * 정산(수익·계좌)은 아래쪽에 따로 있다 — 그쪽은 `@draft`가 아니라 이미 구현돼 있다.
 */
import type { PageResponse, PaymentMethod } from "./common";

/** 충전 건 상태. READY는 결제창을 띄울 준비만 된 상태로 코인은 아직 안 늘었다 */
export type CoinChargeStatus = "READY" | "PAID" | "FAILED" | "CANCELED";
/** 참가비 결제 상태. REFUNDED면 입장 자격도 사라진다 */
export type EntryPaymentStatus = "PAID" | "REFUNDED";
/** 코인 원장 종류. `amount` 부호와 짝이 맞는다 — 차감은 DEDUCT가 아니라 ENTRY다 */
export type CoinTransactionType = "CHARGE" | "ENTRY" | "REFUND" | "AI_ANALYSIS" | "ADMIN_ADJUST";
/** 원장 한 줄이 가리키는 대상. 영수증으로 이어갈 때 `refId`와 함께 쓴다 */
export type CoinRefType = "COIN_CHARGE" | "ENTRY_PAYMENT" | "AI_FEEDBACK";

/** 코인 내역 한 줄 */
export type CoinTransactionRow = {
  id: number;
  type: CoinTransactionType;
  /** 부호 있는 금액. + 충전·환급, − 차감 */
  amount: number;
  /** 이 건을 적용한 뒤의 잔액 */
  balanceAfter: number;
  /** ADMIN_ADJUST처럼 가리키는 대상이 없으면 빠진다 */
  refType?: CoinRefType;
  refId?: number;
  /** 차감 **그 시점의** 방 제목 + 영수증 번호. 방 제목이 나중에 바뀌어도 안 흔들린다 */
  description?: string;
  createdAt: string;
};

/** GET /users/me/coins — 보유 코인·기본 결제 수단·최근 내역 1건 */
export type CoinBalanceResponse = {
  balance: number;
  /** 설정한 적 없으면 키 자체가 없다 */
  defaultPaymentMethod?: PaymentMethod;
  /** 내역이 하나도 없으면 키 자체가 없다 */
  lastTransaction?: CoinTransactionRow;
};

/**
 * GET /users/me/coins/transactions?page=0&size=20 — **오프셋 페이지**다.
 * `Pageable`이 아니라 `page`·`size`를 직접 받는다(`sort`는 안 먹는다).
 */
export type CoinTransactionPageResponse = PageResponse<CoinTransactionRow>;

/** PUT /users/me/payment-method — 충전 화면이 미리 골라 둘 값일 뿐이다 */
export type PaymentMethodRequest = { method: PaymentMethod };
export type PaymentMethodResponse = { defaultPaymentMethod: PaymentMethod };

/** POST /coins/charges */
export type CreateChargeRequest = {
  /** 충전할 코인. 1,000 ~ 1,000,000 C */
  amount: number;
  /** 비우면 기본 결제 수단을 쓴다 */
  method?: PaymentMethod;
  /** 넣으면 confirm이 충전 + 참가비 차감을 한 번에 끝낸다 */
  roomId?: number;
};

/**
 * 결제창 호출 파라미터 — 그대로 포트원 V2 브라우저 SDK에 넘긴다(`amount`→`totalAmount`).
 * 서버는 포트원을 부르지 않는다. API Secret·웹훅 시크릿은 여기 실리지 않는다.
 */
export type CoinChargeResponse = {
  chargeId: number;
  /** 포트원 SDK의 paymentId로 그대로 넘긴다 */
  paymentId: string;
  storeId: string;
  channelKey: string;
  amount: number;
  /** 결제창에 표시될 주문명 */
  orderName: string;
  status: CoinChargeStatus;
};

/**
 * POST /coins/charges/{chargeId}/confirm — **본문 없음**.
 * 서버가 포트원에 실제 상태·금액을 물어보고 일치할 때만 적립한다(클라이언트 금액은 안 믿는다).
 * **멱등하다** — 이미 확정된 건에 다시 불러도 200이고 코인은 한 번만 들어간다.
 */
export type CoinChargeConfirmResponse = {
  chargeId: number;
  status: CoinChargeStatus;
  /** 충전된 코인 */
  amount: number;
  /** 충전(및 참가비 차감)까지 반영된 잔액 */
  balanceAfter: number;
  paidAt?: string;
  /** 요청에 roomId를 실었을 때만. 이어서 처리된 참가비 결제 */
  entryPayment?: EntryPaymentResponse;
};

/**
 * POST /rooms/{roomId}/entry-payments — **본문 없음**.
 * 금액은 방에 걸린 참가비를 서버가 읽는다. 잔액이 모자라면 402 `INSUFFICIENT_COINS`다.
 */
export type EntryPaymentResponse = {
  paymentId: number;
  /** 영수증 번호 PM-YYYY-MMDD-NNNN */
  paymentNo: string;
  roomId: number;
  /** 차감한 코인 */
  amount: number;
  status: EntryPaymentStatus;
  /** 차감 후 남은 코인 */
  balanceAfter: number;
  paidAt: string;
};

/**
 * POST /entry-payments/{paymentId}/cancel — **세션 시작 전까지만**.
 * 차감한 코인을 전액 돌려주고 입장해 있었다면 방에서도 빠진다.
 * 시작된 뒤에는 409 `REFUND_WINDOW_CLOSED`.
 */
export type EntryPaymentCancelResponse = {
  paymentId: number;
  paymentNo: string;
  roomId: number;
  status: EntryPaymentStatus;
  /** 돌려준 코인. 항상 결제 전액 */
  refundedAmount: number;
  balanceAfter: number;
  refundedAt?: string;
};

/** 402 `INSUFFICIENT_COINS`의 `data`. 잔액을 다시 조회하지 말고 이 값으로 충전 화면을 그린다 */
export type InsufficientCoinsData = {
  /** 필요한 코인 */
  required: number;
  /** 지금 잔액 */
  balance: number;
  /** 모자란 코인 = required − balance */
  shortfall: number;
};

/**
 * 서버가 검증하는 정책 범위(참고용).
 *
 * 서버 `PolicyProperties`의 env 바인딩이라 운영에서 조정될 수 있다 —
 * **화면 안내는 이 상수가 아니라 400 응답의 `message`를 쓴다.**
 */
export const PAYMENT_POLICY = {
  /** 참가비 범위 (C) */
  entryFee: { min: 100, max: 10_000 },
  /** 1회 충전 금액 범위 (C) */
  chargeAmount: { min: 1_000, max: 1_000_000 },
  /** 유료 방 개설에 필요한 호스트 등급 — 검증된 운영자 */
  paidRoomMinHostLevel: 3,
} as const;

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

/** 정산 계좌 — 조회는 마스킹된 번호만 준다 */
export type SettlementAccountView = {
  bankCode: string;
  bankName: string;
  /** 뒤 네 자리만 남기고 가린다 ("********6789") */
  accountNoMasked: string;
  holderName: string;
  /** 예금주 실명 확인 여부. 계좌를 바꾸면 다시 false가 된다 */
  verified: boolean;
  verifiedAt?: string;
  updatedAt?: string;
};

/**
 * GET/PUT /users/me/settlement-account.
 * **미등록도 200이다** — `registered: false`로 오고 `account`가 빠진다(404가 아니다).
 */
export type SettlementAccountResponse = {
  registered: boolean;
  account?: SettlementAccountView;
};

/** PUT 본문 — 등록·변경. 번호는 마스킹하지 않은 원본을 보낸다 */
export type SettlementAccountRequest = {
  bankCode: string;
  bankName: string;
  accountNo: string;
  holderName: string;
};
