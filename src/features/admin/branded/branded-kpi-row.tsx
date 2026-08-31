import { formatDeltaPct, formatKrw, formatNumber, formatShortDate } from "@/lib/format";
import type { AdminAdKpis } from "@/lib/types/dto";
import { KpiCard, type KpiItem } from "../components/kpi-card";
import type { Tone } from "../components/tone";

type Props = { kpis: AdminAdKpis };

/** A-06 상단 KPI 4칸. */
export function BrandedKpiRow({ kpis }: Props) {
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

function toItems(k: AdminAdKpis): KpiItem[] {
  return [
    {
      label: "진행 중 캠페인",
      value: formatNumber(k.activeCampaigns),
      chip: `신규 ${formatNumber(k.newCampaigns)}`,
      tone: "info",
    },
    {
      label: "이번 달 광고 수익",
      value: formatKrw(k.monthlyAdRevenueKrw),
      chip: formatDeltaPct(k.monthlyAdRevenueDeltaPct),
      tone: deltaTone(k.monthlyAdRevenueDeltaPct),
    },
    {
      label: `학생 배분액 (${k.studentShareRatePct}%)`,
      value: formatKrw(k.studentShareKrw),
      chip: `${formatShortDate(k.payoutDate)} 지급`,
      tone: "info",
    },
    {
      label: "브랜디드 퀴즈",
      value: `${formatNumber(k.brandedQuizCount)}건`,
      chip: `계약 ${formatKrw(k.brandedContractKrw)}`,
      tone: "success",
    },
  ];
}
