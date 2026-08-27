import { formatNumber, formatPct } from "@/lib/format";
import type { UserComposition } from "@/lib/types/dto";
import { cn } from "@/lib/utils";
import { AdminCard } from "../components/admin-card";
import { AdminCardHead } from "../components/admin-card-head";

type Props = { composition: UserComposition };

/** 선생님·학생 비율 누적 막대 + 범례. */
export function UserCompositionCard({ composition }: Props) {
  const total = composition.teachers + composition.students;
  const totalLabel = `전체 ${formatNumber(total)}명`;
  const segments = toSegments(composition, total);

  return (
    <AdminCard className="min-w-0 flex-1">
      <AdminCardHead title="사용자 구성" hint={totalLabel} />
      <div className="flex w-full gap-[2px]" role="img" aria-label={`사용자 구성. ${totalLabel}`}>
        {segments.map((s) => (
          <div
            key={s.label}
            style={{ flexGrow: s.count }}
            className={cn("h-[34px] min-w-px", s.fill, s.round)}
          />
        ))}
      </div>
      {segments.map((s) => (
        <div key={s.label} className="flex w-full items-center gap-[9px]">
          <span aria-hidden className={cn("size-[9px] shrink-0 rounded-full", s.fill)} />
          <p className="text-label-lg text-foreground">{s.label}</p>
          <p className="ml-1 text-label-lg text-foreground">{formatNumber(s.count)}</p>
          <p className="text-label-md text-muted-foreground">{s.ratio}</p>
        </div>
      ))}
    </AdminCard>
  );
}

type Segment = { label: string; count: number; ratio: string; fill: string; round: string };

function toSegments(c: UserComposition, total: number): Segment[] {
  const ratio = (count: number) => formatPct(total === 0 ? 0 : (count / total) * 100);

  return [
    {
      label: "선생님",
      count: c.teachers,
      ratio: ratio(c.teachers),
      fill: "bg-primary",
      round: "rounded-l-[8px]",
    },
    {
      label: "학생",
      count: c.students,
      ratio: ratio(c.students),
      fill: "bg-primary-soft",
      round: "rounded-r-[8px]",
    },
  ];
}
