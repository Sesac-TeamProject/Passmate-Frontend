import type { SystemComponentStatus, SystemHealth } from "@/lib/types/dto";
import { cn } from "@/lib/utils";
import { AdminCard } from "../components/admin-card";
import { AdminCardHead } from "../components/admin-card-head";
import { StatChip } from "../components/stat-chip";
import type { Tone } from "../components/tone";

const HEALTH_CHIP: Record<SystemHealth, { label: string; tone: Tone }> = {
  OK: { label: "정상", tone: "success" },
  DELAYED: { label: "지연", tone: "warning" },
  NEEDS_ATTENTION: { label: "점검 필요", tone: "danger" },
};

type Props = { components: SystemComponentStatus[] };

/** 인프라 상태 목록. 지연·점검 필요는 색으로 구분한다. */
export function SystemStatusCard({ components }: Props) {
  return (
    <AdminCard className="w-[330px] shrink-0">
      <AdminCardHead title="시스템 상태" />
      <ul className="w-full">
        {components.map((c, i) => {
          const chip = HEALTH_CHIP[c.health];

          return (
            <li
              key={c.name}
              className={cn(
                "flex items-center gap-[10px]",
                i === 0 ? "pb-[9px]" : "border-t border-border py-[9px]",
              )}
            >
              <div className="flex min-w-0 flex-col gap-px">
                <p className="text-label-lg text-foreground">{c.name}</p>
                <p className="text-label-md text-muted-foreground">{c.metric}</p>
              </div>
              <span aria-hidden className="w-1 shrink-0" />
              <StatChip tone={chip.tone}>{chip.label}</StatChip>
            </li>
          );
        })}
      </ul>
    </AdminCard>
  );
}
