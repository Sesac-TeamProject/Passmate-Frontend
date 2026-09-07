"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toMeErrorMessage } from "@/features/me/adapt";
import { ChargePage } from "@/features/me/coins/charge-page";
import { DEFAULT_CHARGE_AMOUNT } from "@/features/me/coins/types";
import { payMethodFromWire, requestPayment } from "@/lib/portone";
import { useCoinBalance, useConfirmCharge, useCreateCharge } from "@/lib/queries/use-payments";

/** C-02-4 · C-02-5 컨테이너. 금액 선택과 포트원 결제창 호출을 소유한다 — 결제 수단은 결제창 안에서 고른다. */
export default function Page() {
  const router = useRouter();
  const balance = useCoinBalance();
  const createCharge = useCreateCharge();
  const confirmCharge = useConfirmCharge();

  const [amount, setAmount] = useState<number>(DEFAULT_CHARGE_AMOUNT);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setPending(true);
    setError(null);
    try {
      const charge = await createCharge.mutateAsync({ amount });
      // 결제창이 성공으로 닫혀도 이 시점엔 코인이 아직 안 늘었다 — confirm이 적립한다
      const result = await requestPayment(charge);

      if (!result.ok) {
        setPending(false);
        setError(result.message);
        return;
      }

      const confirmed = await confirmCharge.mutateAsync(charge.chargeId);
      const params = new URLSearchParams({
        amount: String(confirmed.amount),
        paymentId: charge.paymentId,
      });
      // 실제로 쓴 수단은 서버가 포트원 조회로 알아낸다 — 못 알아낸 결제는 수단 표시를 생략한다
      const usedMethod = payMethodFromWire(confirmed.method);
      if (usedMethod) params.set("method", usedMethod);
      router.push(`/me/coins/charge/complete?${params.toString()}`);
    } catch (err) {
      setPending(false);
      setError(toMeErrorMessage(err));
    }
  };

  if (balance.isPending) return <ScreenLoading />;
  if (balance.isError)
    return <ScreenError message={balance.error.message} onRetry={() => balance.refetch()} />;

  return (
    <ChargePage
      balance={balance.data.balance ?? 0}
      amount={amount}
      onAmountChange={setAmount}
      pending={pending}
      error={error}
      onSubmit={() => void handleSubmit()}
    />
  );
}
