"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toMeErrorMessage, toWireMethod } from "@/features/me/adapt";
import { ChargePage } from "@/features/me/coins/charge-page";
import { DEFAULT_CHARGE_AMOUNT } from "@/features/me/coins/types";
import { formatNumber } from "@/lib/format";
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
      const checkout = await createCharge.mutateAsync({ amount, method: toWireMethod(payMethod) });
      const result = await requestPayment({
        orderName: checkout.orderName ?? `패스메이트 코인 ${formatNumber(amount)} C 충전`,
        amount,
        payMethod,
      });
      if (!result.ok) {
        setPending(false);
        setError(result.message);
        return;
      }
      if (!checkout.chargeId) throw new Error("결제 준비에 실패했어요");
      await confirmCharge.mutateAsync({
        chargeId: checkout.chargeId,
        body: { paymentId: result.paymentId },
      });
      const params = new URLSearchParams({
        amount: String(amount),
        method: payMethod,
        paymentId: result.paymentId,
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
