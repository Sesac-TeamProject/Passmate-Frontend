"use client";

import { use, useState } from "react";
import {
  CHARGE_OPTIONS,
  COIN_BALANCE,
  PAID_ROOM,
  PARTICIPANT_DEFAULT,
} from "@/features/participant/pay/mock";
import { PayPage, type PayFormValues, type PayStep } from "@/features/participant/pay/pay-page";
import type { PaymentReceipt } from "@/features/participant/pay/payment-complete-card";
import { requestPayment } from "@/lib/portone";

const INITIAL_VALUES: PayFormValues = {
  nickname: PARTICIPANT_DEFAULT.nickname,
  avatar: PARTICIPANT_DEFAULT.avatar,
  chargeAmount: CHARGE_OPTIONS[0],
  payMethod: "kakaopay",
  agreed: false,
};

/**
 * W-11 컨테이너 — 충전 금액·결제 수단·동의 상태와 단계(idle → paying → done)를 소유하고
 * 포트원 결제창 호출(`lib/portone.requestPayment`)만 한다. 렌더는 PayPage.
 */
export default function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  // TODO(API): 방 조회(code)·코인 잔액 조회 계약 확정 후 lib/queries로 교체
  const room = { ...PAID_ROOM, code };
  const balance = COIN_BALANCE;

  const [values, setValues] = useState<PayFormValues>(INITIAL_VALUES);
  const [step, setStep] = useState<PayStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);

  const handleSubmit = async () => {
    if (!values.agreed || step === "paying") return;
    setStep("paying");
    setError(null);

    const result = await requestPayment({
      orderName: `패스메이트 코인 ${values.chargeAmount.toLocaleString()} C 충전`,
      amount: values.chargeAmount,
      payMethod: values.payMethod,
    });

    if (!result.ok) {
      setError(
        result.code === "CANCELLED"
          ? "결제가 취소됐어요 — 다시 시도해 주세요"
          : `결제에 실패했어요 — ${result.message}`,
      );
      setStep("idle");
      return;
    }

    // TODO(API): 서버 결제 검증(lib/api/payments.ts) → 코인 충전·차감 반영 후 잔액 재조회
    setReceipt({
      paymentId: result.paymentId,
      roomCode: room.code,
      roomTitle: room.title,
      chargeAmount: values.chargeAmount,
      payMethod: values.payMethod,
      deducted: room.fee,
      remaining: balance + values.chargeAmount - room.fee,
    });
    setStep("done");
  };

  return (
    <PayPage
      room={room}
      balance={balance}
      chargeOptions={CHARGE_OPTIONS}
      values={values}
      step={step}
      error={error}
      receipt={receipt}
      onChange={setValues}
      onSubmit={handleSubmit}
    />
  );
}
