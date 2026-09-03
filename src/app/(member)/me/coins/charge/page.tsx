"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toMeErrorMessage, toWireMethod } from "@/features/me/adapt";
import { ChargePage } from "@/features/me/coins/charge-page";
import { DEFAULT_CHARGE_AMOUNT } from "@/features/me/coins/types";
import { requestPayment, type PayMethod } from "@/lib/portone";
import { useCoinBalance, useConfirmCharge, useCreateCharge } from "@/lib/queries/use-payments";

/** C-02-4 · C-02-5 컨테이너. 금액·결제 수단 선택과 포트원 결제창 호출을 소유한다. */
export default function Page() {
  const router = useRouter();
  const balance = useCoinBalance();
  const createCharge = useCreateCharge();
  const confirmCharge = useConfirmCharge();

  const [amount, setAmount] = useState<number>(DEFAULT_CHARGE_AMOUNT);
  const [payMethod, setPayMethod] = useState<PayMethod>("kakaopay");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setPending(true);
    setError(null);
    try {
      const method = toWireMethod(payMethod);
      const charge = await createCharge.mutateAsync({ amount, method });
      // 결제창이 성공으로 닫혀도 이 시점엔 코인이 아직 안 늘었다 — confirm이 적립한다
      const result = await requestPayment(charge, method);

      if (!result.ok) {
        setPending(false);
        setError(result.message);
        return;
      }

      const confirmed = await confirmCharge.mutateAsync(charge.chargeId);
      const params = new URLSearchParams({
        amount: String(confirmed.amount),
        method: payMethod,
        paymentId: charge.paymentId,
      });
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
      payMethod={payMethod}
      onPayMethodChange={setPayMethod}
      pending={pending}
      error={error}
      onSubmit={() => void handleSubmit()}
    />
  );
}
