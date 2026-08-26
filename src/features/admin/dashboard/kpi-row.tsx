import { StatChip } from "../components/stat-chip";
import { DASHBOARD_KPIS } from "../mock";

/** 상단 KPI 5칸. 화면 폭에 따라 균등 분할된다. */
export function KpiRow() {
  return (
    <div className="grid w-full grid-cols-2 gap-[14px] lg:grid-cols-3 xl:grid-cols-5">
      {DASHBOARD_KPIS.map((kpi) => (
        <div
          key={kpi.label}
          className="flex min-w-0 flex-col items-start gap-[6px] rounded-[14px] border border-[#e5e7eb] bg-white px-[18px] py-[14px]"
        >
          <p className="text-[11.5px] leading-[1.3] font-medium text-[#6e6a85]">{kpi.label}</p>
          <p className="text-[26px] leading-[1.15] font-black text-[#1b1733]">{kpi.value}</p>
          <StatChip tone={kpi.tone}>{kpi.chip}</StatChip>
        </div>
      ))}
    </div>
  );
}
