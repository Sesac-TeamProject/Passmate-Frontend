import { formatHours, formatNumber } from "@/lib/format";
import type { AdminReportKpis } from "@/lib/types/dto";
import { KpiCard, type KpiItem } from "../components/kpi-card";

type Props = { kpis: AdminReportKpis };

/** A-04 상단 KPI 4칸. */
export function ReportKpiRow({ kpis }: Props) {
  const items = toItems(kpis);

  return (
    <div className="flex w-full items-start gap-[14px]">
      {items.map((item) => (
        <KpiCard key={item.label} item={item} />
      ))}
    </div>
  );
}

function signed(value: number, unit: string): string {
  if (value > 0) return `▲ ${value}${unit}`;
  if (value < 0) return `▼ ${Math.abs(value)}${unit}`;
  return `0${unit}`;
}

function toItems(k: AdminReportKpis): KpiItem[] {
  const hasPending = k.pendingReports > 0;
  // 처리 시간은 줄어드는 게 좋은 지표라 감소를 초록으로 표시한다.
  const isHandlingFaster = k.avgHandlingDeltaHours <= 0;

  return [
    {
      label: "미처리 신고",
      value: formatNumber(k.pendingReports),
      chip: hasPending ? "확인 필요" : "없음",
      tone: hasPending ? "warning" : "success",
    },
    {
      label: "오늘 접수",
      value: formatNumber(k.receivedToday),
      chip: signed(k.receivedTodayDelta, "건"),
      tone: "info",
    },
    {
      label: "제재 중 계정",
      value: formatNumber(k.sanctionedAccounts),
      chip: `7일 정지 ${formatNumber(k.suspended7dCount)}`,
      tone: "danger",
    },
    {
      label: "평균 처리 시간",
      value: formatHours(k.avgHandlingHours),
      chip: signed(k.avgHandlingDeltaHours, "h"),
      tone: isHandlingFaster ? "success" : "warning",
    },
  ];
}
