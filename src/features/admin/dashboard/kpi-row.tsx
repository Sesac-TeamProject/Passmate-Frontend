import { formatDeltaPct, formatKrw, formatNumber } from "@/lib/format";
import type { AdminDashboardKpis } from "@/lib/types/dto";
import { StatChip } from "../components/stat-chip";
import type { Tone } from "../components/tone";

type Props = { kpis: AdminDashboardKpis };

/** 상단 KPI 5칸. 시안대로 한 줄에 균등 배치한다. */
export function KpiRow({ kpis }: Props) {
  const items = toItems(kpis);

  return (
    <div className="flex w-full items-start gap-[14px]">
      {items.map((kpi) => (
        <div
          key={kpi.label}
          className="flex min-w-0 flex-1 flex-col items-start gap-[6px] rounded-[14px] border border-border bg-card px-[18px] py-[14px]"
        >
          <p className="text-label-lg whitespace-nowrap text-muted-foreground">{kpi.label}</p>
          <p className="text-display-sm whitespace-nowrap text-foreground">{kpi.value}</p>
          <StatChip tone={kpi.tone}>{kpi.chip}</StatChip>
        </div>
      ))}
    </div>
  );
}

type KpiItem = { label: string; value: string; chip: string; tone: Tone };

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
