import { InitialTile } from "@/components/common/initial-tile";
import type { DashboardStat } from "@/features/host/mock";

type Props = { stats: DashboardStat[] };

export function StatCards({ stats }: Props) {
  return (
    <section className="grid grid-cols-3 gap-4">
      {stats.map((s) => (
        <div
          key={s.id}
          className="flex items-center gap-3.5 rounded-[20px] border bg-card px-5 py-[18px]"
        >
          <InitialTile label={s.tile.label} tone={s.tile.tone} />
          <div className="flex flex-col gap-0.5">
            <span className="text-label-lg text-muted-foreground">{s.label}</span>
            <span className="text-heading-lg text-ink">{s.value}</span>
          </div>
        </div>
      ))}
    </section>
  );
}
