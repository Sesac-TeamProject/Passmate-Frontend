import Link from "next/link";
import { InitialTile } from "@/components/common/initial-tile";
import type { QuestionSet } from "@/features/teacher/mock";
import { SectionHeader } from "./section-header";

type Props = { sets: QuestionSet[]; allHref: string };

export function QuestionSetCards({ sets, allHref }: Props) {
  return (
    <section className="flex flex-col gap-3">
      <SectionHeader title="문제 세트" href={allHref} />
      <div className="grid grid-cols-3 gap-4">
        {sets.map((qs) => (
          <Link
            key={qs.id}
            href={allHref}
            className="flex flex-col gap-3 rounded-[20px] border bg-card px-5 py-[18px] transition-colors hover:border-mint"
          >
            <InitialTile label={qs.tile.label} tone={qs.tile.tone} />
            <div className="flex flex-col gap-[3px]">
              <span className="text-base font-black text-ink">{qs.title}</span>
              <span className="text-xs text-muted-foreground">{qs.summary}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
