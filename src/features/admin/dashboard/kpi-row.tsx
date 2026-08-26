import { cn } from "@/lib/utils";
import { StatChip } from "../components/stat-chip";
import { TYPE } from "../components/typography";
import { DASHBOARD_KPIS } from "../mock";

/** 상단 KPI 5칸. 시안대로 한 줄에 균등 배치한다. */
export function KpiRow() {
  return (
    <div className="flex w-full items-start gap-[14px]">
      {DASHBOARD_KPIS.map((kpi) => (
        <div
          key={kpi.label}
          className="flex min-w-0 flex-1 flex-col items-start gap-[6px] rounded-[14px] border border-[#e5e7eb] bg-white px-[18px] py-[14px]"
        >
          <p className={cn("whitespace-nowrap text-[#6e6a85]", TYPE.labelLg)}>{kpi.label}</p>
          <p className={cn("whitespace-nowrap text-[#1b1733]", TYPE.displaySm)}>{kpi.value}</p>
          <StatChip tone={kpi.tone}>{kpi.chip}</StatChip>
        </div>
      ))}
    </div>
  );
}
