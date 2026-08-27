import { StatChip } from "./stat-chip";
import type { Tone } from "./tone";

export type KpiItem = {
  label: string;
  value: string;
  chip: string;
  tone: Tone;
};

type Props = { item: KpiItem };

/** 상단 지표 카드 한 칸 (A-01 5칸, A-04 4칸 공통). 한 줄에 균등 배치되도록 flex-1. */
export function KpiCard({ item }: Props) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-start gap-[6px] rounded-[14px] border border-border bg-card px-[18px] py-[14px]">
      <p className="text-label-lg whitespace-nowrap text-muted-foreground">{item.label}</p>
      <p className="text-display-sm whitespace-nowrap text-foreground">{item.value}</p>
      <StatChip tone={item.tone}>{item.chip}</StatChip>
    </div>
  );
}
