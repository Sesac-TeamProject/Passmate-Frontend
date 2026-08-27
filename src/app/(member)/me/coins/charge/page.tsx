"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChargePage } from "@/features/me/coins/charge-page";
import { COIN_BALANCE, DEFAULT_CHARGE_AMOUNT } from "@/features/me/coins/mock";
import { formatNumber } from "@/lib/format";
import { requestPayment, type PayMethod } from "@/lib/portone";

/** C-02-4 · C-02-5 컨테이너. 금액·결제 수단 선택과 포트원 결제창 호출을 소유한다. */
export default function Page() {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(DEFAULT_CHARGE_AMOUNT);
  const [payMethod, setPayMethod] = useState<PayMethod>("kakaopay");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setPending(true);
    setError(null);
    // TODO(API): 결제 준비(paymentId 발급) → 포트원 결제창 → 서버 검증 순으로 교체. 지금은 목 결제창(0.8초 뒤 성공)
    const result = await requestPayment({
      orderName: `패스메이트 코인 ${formatNumber(amount)} C 충전`,
      amount,
      payMethod,
    });
    if (!result.ok) {
      setPending(false);
      setError(result.message);
      return;
    }
    const params = new URLSearchParams({
      amount: String(amount),
      method: payMethod,
      paymentId: result.paymentId,
    });
    router.push(`/me/coins/charge/complete?${params.toString()}`);
  };

  return (
    <ChargePage
      balance={COIN_BALANCE}
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
