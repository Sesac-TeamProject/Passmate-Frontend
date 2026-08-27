import { formatDeltaPct, formatKrw, formatNumber, formatShortDate } from "@/lib/format";
import type { AdminPaymentKpis } from "@/lib/types/dto";
import { KpiCard, type KpiItem } from "../components/kpi-card";
import type { Tone } from "../components/tone";

type Props = { kpis: AdminPaymentKpis };

/** A-05 상단 KPI 4칸. */
export function PaymentKpiRow({ kpis }: Props) {
  const items = toItems(kpis);

  return (
    <div className="flex w-full items-start gap-[14px]">
      {items.map((item) => (
        <KpiCard key={item.label} item={item} />
      ))}
    </div>
  );
}

function deltaTone(pct: number): Tone {
  if (pct < 0) return "danger";
  return "success";
}

function toItems(k: AdminPaymentKpis): KpiItem[] {
  return [
    {
      label: "이번 달 결제액",
      value: formatKrw(k.monthlyPaymentKrw),
      chip: formatDeltaPct(k.monthlyPaymentDeltaPct),
      tone: deltaTone(k.monthlyPaymentDeltaPct),
    },
    {
      label: `플랫폼 수수료 (${k.platformFeeRatePct}%)`,
      value: formatKrw(k.platformFeeKrw),
      chip: formatDeltaPct(k.platformFeeDeltaPct),
      tone: deltaTone(k.platformFeeDeltaPct),
    },
    {
      label: "선생님 정산 예정",
      value: formatKrw(k.teacherPayoutKrw),
      chip: `${formatShortDate(k.payoutDate)} 지급`,
      tone: "info",
    },
    {
      label: "환불 처리",
      value: formatKrw(k.refundKrw),
      chip: `${formatNumber(k.refundCount)}건`,
      tone: "warning",
    },
  ];
}
