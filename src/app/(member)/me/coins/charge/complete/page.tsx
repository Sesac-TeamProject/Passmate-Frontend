"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { ChargeCompletePage } from "@/features/me/coins/charge-complete-page";
import { DEFAULT_CHARGE_AMOUNT } from "@/features/me/coins/types";
import { PAY_METHOD_LABEL, type PayMethod } from "@/lib/portone";
import { useCoinBalance } from "@/lib/queries/use-payments";

function isPayMethod(value: string | null): value is PayMethod {
  return value !== null && value in PAY_METHOD_LABEL;
}

/** 쿼리(amount · method · paymentId)를 읽는다 — useSearchParams 는 Suspense 경계 안에서만 */
function ChargeCompleteContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const balance = useCoinBalance();

  const amountParam = Number(searchParams.get("amount"));
  const amount =
    Number.isFinite(amountParam) && amountParam > 0 ? amountParam : DEFAULT_CHARGE_AMOUNT;
  const methodParam = searchParams.get("method");
  const payMethod: PayMethod = isPayMethod(methodParam) ? methodParam : "kakaopay";

  if (balance.isPending) return <ScreenLoading />;
  if (balance.isError)
    return <ScreenError message={balance.error.message} onRetry={() => balance.refetch()} />;

  return (
    <ChargeCompletePage
      amount={amount}
      payMethod={payMethod}
      balanceAfter={balance.data.balance ?? 0}
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
