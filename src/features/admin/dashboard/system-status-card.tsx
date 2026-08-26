import { AdminCard, AdminCardHead } from "../components/admin-card";
import { StatChip } from "../components/stat-chip";
import { SYSTEM_STATUS } from "../mock";

/** 인프라 상태 목록. 지연·점검 필요는 색으로 구분한다. */
export function SystemStatusCard() {
  return (
    <AdminCard className="w-full shrink-0 xl:w-[330px]">
      <AdminCardHead title="시스템 상태" />
      <ul className="w-full">
        {SYSTEM_STATUS.map((s, i) => (
          <li
            key={s.name}
            className={
              "flex items-center gap-[10px] " +
              (i === 0 ? "pb-[9px]" : "border-t border-[#e5e7eb] py-[9px]")
            }
          >
            <div className="flex min-w-0 flex-col gap-px">
              <p className="text-[11.5px] leading-[1.25] font-medium text-[#1b1733]">{s.name}</p>
              <p className="text-[10px] leading-[1.2] text-[#6e6a85]">{s.metric}</p>
            </div>
            <StatChip tone={s.tone} className="ml-auto">
              {s.label}
            </StatChip>
          </li>
        ))}
      </ul>
    </AdminCard>
  );
}
