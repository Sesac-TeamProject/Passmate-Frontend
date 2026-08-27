import { formatKoreanDate } from "@/lib/format";
import type { AdminPaymentsResponse, AdminSettlementsResponse } from "@/lib/types/dto";
import { AdminCard } from "../components/admin-card";
import { AdminCardHead } from "../components/admin-card-head";
import { PaymentKpiRow } from "./payment-kpi-row";
import { PaymentTable } from "./payment-table";
import { SettlementTable } from "./settlement-table";

type Props = {
  payments: AdminPaymentsResponse;
  settlements: AdminSettlementsResponse;
};

/** A-05 결제 · 정산 렌더 전용 뷰 (규칙 문서 §11-1). */
export function AdminPaymentsView({ payments, settlements }: Props) {
  const settlementHint = `${formatKoreanDate(settlements.payoutDate)} 일괄 지급`;

  return (
    <div className="flex flex-1 flex-col gap-[14px] px-7 pt-4 pb-[14px]">
      <PaymentKpiRow kpis={payments.kpis} />
      <AdminCard>
        <AdminCardHead title="유료 방 결제 내역" hint="최근 결제순" />
        <PaymentTable payments={payments.items} />
      </AdminCard>
      <AdminCard className="min-h-0 flex-1">
        <AdminCardHead title="정산 대기 선생님" hint={settlementHint} />
        <SettlementTable settlements={settlements.items} />
      </AdminCard>
    </div>
  );
}
