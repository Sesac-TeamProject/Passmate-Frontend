import { StudentAvatar } from "@/components/common/student-avatar";
import type { Student } from "@/features/host/types";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export type PodiumPlace = 1 | 2 | 3;
export type PodiumEntry = { rank: PodiumPlace; student: Student; score: number };

/** 등수별 스탠드 — 1위가 가장 높다 (시안 788:8844) */
const STAND = {
  1: { height: "h-25", cls: "bg-choice-c text-choice-c-foreground" },
  2: { height: "h-[78px]", cls: "bg-muted text-ink" },
  3: { height: "h-16", cls: "bg-avatar-peach text-avatar-peach-foreground" },
} as const;

/** 시안이 세우는 순서 — 2등 · 1등 · 3등 (가운데가 1등) */
const ORDER: PodiumPlace[] = [2, 1, 3];

type Props = { entries: PodiumEntry[] };

/** 최종 결과 포디움 카드 — 상위 3명 (시안 788:8844) */
export function PodiumCard({ entries }: Props) {
  const byRank = new Map(entries.map((entry) => [entry.rank, entry]));

  return (
    <section className="flex flex-col rounded-2xl border bg-card">
      {entries.length === 0 ? (
        <p className="flex h-[182px] items-center justify-center text-label-md text-muted-foreground">
          순위는 채점이 끝나면 채워져요
        </p>
      ) : (
        <ol className="flex h-[182px] items-end justify-center gap-1">
          {ORDER.map((place) => {
            const entry = byRank.get(place);
            if (entry === undefined) return null;

            return <Stand key={place} entry={entry} />;
          })}
        </ol>
      )}

      <p className="border-t px-[18px] py-2 text-label-md text-muted-foreground">
        상위 {entries.length}명
      </p>
    </section>
  );
}

function Stand({ entry }: { entry: PodiumEntry }) {
  const stand = STAND[entry.rank];

  return (
    // 간격 2px — 시안(788:8867~8886)은 아바타·이름·스탠드가 거의 붙어 있다.
    // 6px씩 띄우면 가장 높은 1위 칸이 카드 위로 밀려 아바타가 테두리에 닿는다.
    <li className="flex w-28 flex-col items-center gap-0.5">
      <StudentAvatar avatar={entry.student.avatar} size={48} />
      <span className="max-w-full truncate text-label-lg text-ink">{entry.student.name}</span>
      <span
        className={cn(
          "flex w-22 flex-col items-center justify-start gap-0.5 rounded-xl pt-2.5",
          stand.height,
          stand.cls,
        )}
      >
        <span className="text-heading-lg">{entry.rank}</span>
        <span className="text-label-md">{formatNumber(entry.score)}점</span>
      </span>
    </li>
  );
}
