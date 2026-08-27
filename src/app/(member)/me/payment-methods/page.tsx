"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { PAYMENT_METHODS, type PaymentMethodItem } from "@/features/me/payment-methods/mock";
import { PaymentMethodsPage } from "@/features/me/payment-methods/payment-methods-page";

/** C-02-8 컨테이너. 목록·기본 변경·삭제 다이얼로그를 소유한다. */
export default function Page() {
  // TODO(API): ['me','payment-methods'] 쿼리 + 기본 변경/삭제 뮤테이션으로 교체 — 지금은 목 목록을 로컬 상태로
  const [items, setItems] = useState<PaymentMethodItem[]>(PAYMENT_METHODS);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleSetDefault = (id: string) => {
    setItems((prev) => prev.map((item) => ({ ...item, isDefault: item.id === id })));
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetId) return;
    setItems((prev) => {
      const rest = prev.filter((item) => item.id !== deleteTargetId);
      // 기본 수단을 지웠으면 남은 첫 수단을 기본으로
      if (rest.length > 0 && !rest.some((item) => item.isDefault)) {
        return rest.map((item, index) => ({ ...item, isDefault: index === 0 }));
      }
      return rest;
    });
    setDeleteTargetId(null);
  };

  const handleAdd = () => {
    // TODO(API): 포트원 빌링키 발급(requestIssueBillingKey) 또는 간편결제 연결 — 계약 확정 후
  };

  return (
    <>
      <PaymentMethodsPage
        items={items}
        onSetDefault={handleSetDefault}
        onDelete={setDeleteTargetId}
        onAdd={handleAdd}
      />
      <ConfirmDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
        title="결제 수단을 삭제할까요?"
        confirmLabel="삭제"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
