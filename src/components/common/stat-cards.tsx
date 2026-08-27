import { InitialTile, type TileTone } from "@/components/common/initial-tile";

export type StatItem = {
  id: string;
  label: string;
  value: string;
  tile: { label: string; tone: TileTone };
};

type Props = { stats: StatItem[] };

/** 통계 카드 행 (디자인 W-09·W-10·옛 W-01 공통) — 44px 이니셜 타일 + label-lg 라벨 + heading-lg 값, r20 카드 */
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
