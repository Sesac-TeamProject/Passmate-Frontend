"use client";

import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toMeErrorMessage, toPaymentMethodItems, toWireMethod } from "@/features/me/adapt";
import { PaymentMethodsPage } from "@/features/me/payment-methods/payment-methods-page";
import type { PayMethod } from "@/lib/portone";
import { useCoinBalance, useUpdatePaymentMethod } from "@/lib/queries/use-payments";

// TODO(API): DESIGN_GAPS C-4 — 계약은 기본 결제 수단 1개 선택만 지원한다(카드 목록·삭제·빌링키 없음)
/** C-02-8 컨테이너. 기본 결제 수단 선택을 소유한다. */
export default function Page() {
  const balance = useCoinBalance();
  const update = useUpdatePaymentMethod();

  const handleSetDefault = (id: string) => {
    if (update.isPending) return;
    update.mutate(toWireMethod(id as PayMethod));
  };

  if (balance.isPending) return <ScreenLoading />;
  if (balance.isError)
    return <ScreenError message={balance.error.message} onRetry={() => balance.refetch()} />;

  return (
    <PaymentMethodsPage
      items={toPaymentMethodItems(balance.data.defaultMethod)}
      onSetDefault={handleSetDefault}
      pending={update.isPending}
      errorMessage={update.isError ? toMeErrorMessage(update.error) : null}
    />
  );
}
