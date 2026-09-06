import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelEntryPayment,
  confirmCharge,
  createCharge,
  createEntryPayment,
  getCoinBalance,
  getCoinTransactions,
  getEarnings,
  getSettlementAccount,
  putPaymentMethod,
  putSettlementAccount,
} from "@/lib/api/payments";
import { AppError } from "@/lib/types/app-error";
import type { CreateChargeRequest, PaymentMethod, SettlementAccountRequest } from "@/lib/types/dto";
import { ERROR_CODES } from "@/lib/types/error-codes";
import { qk } from "./keys";

/** GET /users/me/coins */
export function useCoinBalance() {
  return useQuery({
    queryKey: qk.coins,
    queryFn: () => getCoinBalance(),
  });
}

/** GET /users/me/coins/transactions — 오프셋 페이지(`page`·`size`) */
export function useCoinTransactions(page = 0, size = 20) {
  return useQuery({
    queryKey: [...qk.coinTransactions, page, size],
    queryFn: () => getCoinTransactions(page, size),
  });
}

/** POST /coins/charges — roomId 있으면 충전 후 바로 차감할 방 */
export function useCreateCharge() {
  return useMutation({
    mutationFn: (body: CreateChargeRequest) => createCharge(body),
  });
}

/** 결제창이 닫힌 직후 포트원 쪽이 아직 READY일 때 기다렸다 다시 물어보는 간격 */
const CONFIRM_RETRY_DELAY_MS = 1200;
const CONFIRM_RETRY_LIMIT = 2;

/**
 * POST /coins/charges/{chargeId}/confirm — 본문 없음. 성공 시 코인 잔액·내역을 갱신한다.
 *
 * **409 `PAYMENT_NOT_COMPLETED`만 재시도한다** — 결제창이 닫힌 직후 곧바로 부르면 포트원 쪽이
 * 아직 `READY`인 경우다. 두 번까지 다시 물어보고 그래도면 화면이 "결제 확인 중"으로 접는다.
 * 웹훅이 뒤이어 확정하므로 코인은 유실되지 않는다. 다른 오류는 재시도하지 않는다.
 */
export function useConfirmCharge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chargeId: number) => confirmCharge(chargeId),
    retry: (failureCount, error) =>
      failureCount < CONFIRM_RETRY_LIMIT &&
      AppError.isAppError(error) &&
      error.code === ERROR_CODES.PAYMENT_NOT_COMPLETED,
    retryDelay: CONFIRM_RETRY_DELAY_MS,
    onSuccess: () => {
      // qk.me(["me"])는 coins·transactions의 접두다 — 잔액을 함께 읽는 마이페이지까지 한 번에 턴다
      queryClient.invalidateQueries({ queryKey: qk.me });
    },
  });
}

/**
 * POST /rooms/{roomId}/entry-payments — 참가비 코인 차감. **본문 없음**(금액은 서버가 방에서 읽는다).
 * 잔액이 모자라면 402 `INSUFFICIENT_COINS`이고 부족분이 `AppError.data`에 실려 온다.
 */
export function useEntryPayment(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => createEntryPayment(roomId),
    onSuccess: () => {
      // qk.me(["me"])는 coins·transactions의 접두다 — 잔액을 함께 읽는 마이페이지까지 한 번에 턴다
      queryClient.invalidateQueries({ queryKey: qk.me });
    },
  });
}

/**
 * POST /entry-payments/{paymentId}/cancel — 세션 시작 전까지만. 코인으로 전액 돌려주고
 * 입장해 있었다면 방에서도 빠진다. 시작 후에는 409 `REFUND_WINDOW_CLOSED`.
 */
export function useCancelEntryPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: number) => cancelEntryPayment(paymentId),
    onSuccess: () => {
      // qk.me(["me"])는 coins·transactions의 접두다 — 잔액을 함께 읽는 마이페이지까지 한 번에 턴다
      queryClient.invalidateQueries({ queryKey: qk.me });
    },
  });
}

/** GET /users/me/earnings — 수익·정산 요약+내역 */
export function useEarnings() {
  return useQuery({
    queryKey: qk.earnings,
    queryFn: () => getEarnings(),
  });
}

/** GET /users/me/settlement-account. 404는 미등록으로 화면이 처리하므로 재시도하지 않는다 */
export function useSettlementAccount() {
  return useQuery({
    queryKey: qk.settlementAccount,
    queryFn: () => getSettlementAccount(),
    retry: false,
  });
}

/** PUT /users/me/settlement-account. 성공 시 계좌 정보와 수익 내역을 갱신한다 */
export function useUpdateSettlementAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SettlementAccountRequest) => putSettlementAccount(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.settlementAccount });
      queryClient.invalidateQueries({ queryKey: qk.earnings });
    },
  });
}

/** PUT /users/me/payment-method {method}. 성공 시 코인 잔액(기본 결제수단 포함)을 갱신한다 */
export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (method: PaymentMethod) => putPaymentMethod(method),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.coins });
    },
  });
}
