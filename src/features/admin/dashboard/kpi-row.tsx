import { formatDeltaPct, formatKrw, formatNumber } from "@/lib/format";
import type { AdminDashboardKpis } from "@/lib/types/dto";
import { KpiCard, type KpiItem } from "../components/kpi-card";
import type { Tone } from "../components/tone";

type Props = { kpis: AdminDashboardKpis };

/** 상단 KPI 5칸. 시안대로 한 줄에 균등 배치한다. */
export function KpiRow({ kpis }: Props) {
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

function toItems(k: AdminDashboardKpis): KpiItem[] {
  const hasPendingReports = k.pendingReports > 0;

  return [
    {
      label: "총 사용자",
      value: formatNumber(k.totalUsers),
      chip: formatDeltaPct(k.totalUsersDeltaPct),
      tone: deltaTone(k.totalUsersDeltaPct),
    },
    {
      label: "오늘 개설된 방",
      value: formatNumber(k.roomsToday),
      chip: formatDeltaPct(k.roomsTodayDeltaPct),
      tone: deltaTone(k.roomsTodayDeltaPct),
    },
    {
      label: "진행 중 세션",
      value: formatNumber(k.liveSessions),
      chip: "실시간",
      tone: "info",
    },
    {
      label: "이번 달 결제액",
      value: formatKrw(k.monthlyPaymentKrw),
      chip: formatDeltaPct(k.monthlyPaymentDeltaPct),
      tone: deltaTone(k.monthlyPaymentDeltaPct),
    },
    {
      label: "미처리 신고",
      value: formatNumber(k.pendingReports),
      chip: hasPendingReports ? "확인 필요" : "없음",
      tone: hasPendingReports ? "warning" : "success",
    },
  ];
}
