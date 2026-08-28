"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScreenLoading } from "@/components/common/screen-loading";
import { ChargeCompletePage } from "@/features/me/coins/charge-complete-page";
import { COIN_BALANCE, DEFAULT_CHARGE_AMOUNT } from "@/features/me/coins/mock";
import { PAY_METHOD_LABEL, type PayMethod } from "@/lib/portone";

function isPayMethod(value: string | null): value is PayMethod {
  return value !== null && value in PAY_METHOD_LABEL;
}

/** 쿼리(amount · method · paymentId)를 읽는다 — useSearchParams 는 Suspense 경계 안에서만 */
function ChargeCompleteContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const amountParam = Number(searchParams.get("amount"));
  const amount =
    Number.isFinite(amountParam) && amountParam > 0 ? amountParam : DEFAULT_CHARGE_AMOUNT;
  const methodParam = searchParams.get("method");
  const payMethod: PayMethod = isPayMethod(methodParam) ? methodParam : "kakaopay";

  // TODO(API): paymentId 로 ['me','coins','charge',paymentId] 조회 → 충전량·잔액·수단을 서버 값으로 교체
  const balanceAfter = COIN_BALANCE + amount;

  return (
    <ChargeCompletePage
      amount={amount}
      payMethod={payMethod}
      balanceAfter={balanceAfter}
      onConfirm={() => router.push("/me")}
    />
  );
}

/** C-02-6 컨테이너. */
export default function Page() {
  return (
    <Suspense fallback={<ScreenLoading />}>
      <ChargeCompleteContainer />
    </Suspense>
  );
}
