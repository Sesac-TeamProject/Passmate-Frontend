import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
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
import type {
  ConfirmChargeRequest,
  CreateChargeRequest,
  CreateEntryPaymentRequest,
  PaymentMethod,
  SettlementAccountDto,
} from "@/lib/types/dto";
import { qk } from "./keys";

/** GET /users/me/coins */
export function useCoinBalance() {
  return useQuery({
    queryKey: qk.coins,
    queryFn: () => getCoinBalance(),
  });
}

/** GET /users/me/coins/transactions */
export function useCoinTransactions() {
  return useQuery({
    queryKey: qk.coinTransactions,
    queryFn: () => getCoinTransactions(),
  });
}

/** POST /coins/charges — roomId 있으면 충전 후 바로 차감할 방 */
export function useCreateCharge() {
  return useMutation({
    mutationFn: (body: CreateChargeRequest) => createCharge(body),
  });
}

/** POST /coins/charges/{chargeId}/confirm. 성공 시 코인 잔액·내역을 갱신한다 */
export function useConfirmCharge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chargeId, body }: { chargeId: string; body: ConfirmChargeRequest }) =>
      confirmCharge(chargeId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.coins });
      queryClient.invalidateQueries({ queryKey: qk.coinTransactions });
    },
  });
}

/** POST /rooms/{roomId}/entry-payments — 참가비 코인 차감. 402 잔액 부족. 성공 시 코인 잔액을 갱신한다 */
export function useEntryPayment(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateEntryPaymentRequest) => createEntryPayment(roomId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.coins });
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
    mutationFn: (body: SettlementAccountDto) => putSettlementAccount(body),
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
