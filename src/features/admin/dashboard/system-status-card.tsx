import { cn } from "@/lib/utils";
import { AdminCard, AdminCardHead } from "../components/admin-card";
import { StatChip } from "../components/stat-chip";
import { TYPE } from "../components/typography";
import { SYSTEM_STATUS } from "../mock";

/** 인프라 상태 목록. 지연·점검 필요는 색으로 구분한다. */
export function SystemStatusCard() {
  return (
    <AdminCard className="w-[330px] shrink-0">
      <AdminCardHead title="시스템 상태" />
      <ul className="w-full">
        {SYSTEM_STATUS.map((s, i) => (
          <li
            key={s.name}
            className={cn(
              "flex items-center gap-[10px]",
              i === 0 ? "pb-[9px]" : "border-t border-[#e5e7eb] py-[9px]",
            )}
          >
            <div className="flex min-w-0 flex-col gap-px">
              <p className={cn("text-[#1b1733]", TYPE.labelLg)}>{s.name}</p>
              <p className={cn("text-[#6e6a85]", TYPE.labelMd)}>{s.metric}</p>
            </div>
            <span aria-hidden className="w-1 shrink-0" />
            <StatChip tone={s.tone}>{s.label}</StatChip>
          </li>
        ))}
      </ul>
    </AdminCard>
  );
}
