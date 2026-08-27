import { ReputationBadge } from "@/components/common/reputation-badge";
import { LevelEmblem } from "@/features/me/level-emblem";
import { cn } from "@/lib/utils";
import type { LevelStatus } from "./mock";

type Props = { status: LevelStatus };

/** W-09 현재 레벨 카드 — 엠블럼 72 + 명성 뱃지 · 다음 레벨 진행 바 · 혜택 칩 */
export function LevelCard({ status }: Props) {
  const { level, title, achievedLabel, next, perks } = status;

  return (
    <section className="flex flex-1 flex-col gap-3.5 rounded-[20px] border bg-card px-7 py-6">
      <div className="flex items-center gap-3.5">
        <LevelEmblem level={level} size={72} />
        <ReputationBadge level={level} title={title} size="md" />
        <span className="text-label-lg text-muted-foreground">
          Lv.{level} · {achievedLabel}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-label-lg text-ink">
            다음 레벨 — Lv.{next.level} {next.title}
          </span>
          <span className="text-label-lg text-mint-dark">{next.progress}%</span>
        </div>
        <div
          role="progressbar"
          aria-label={`Lv.${next.level} 승급 진행률`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={next.progress}
          className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
        >
          <div className="h-full rounded-full bg-mint" style={{ width: `${next.progress}%` }} />
        </div>
      </div>

      <ul className="flex flex-wrap gap-2">
        {perks.map((perk) => (
          <li
            key={perk.label}
            className={cn(
              "rounded-full px-3 py-[5px] text-label-lg",
              perk.earned
                ? "bg-choice-d text-choice-d-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {perk.earned ? `✓ ${perk.label}` : perk.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
