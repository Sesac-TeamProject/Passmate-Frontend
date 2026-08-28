import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type RecordStatTone = "mint" | "blue" | "orange";

const TONE_CLASS: Record<RecordStatTone, string> = {
  mint: "bg-muted text-mint-dark",
  blue: "bg-blue-soft text-blue",
  orange: "bg-orange-soft text-orange",
};

type Props = {
  icon: LucideIcon;
  tone: RecordStatTone;
  label: string;
  value: string;
};

/**
 * 참여 기록 통계 카드 (W-13) — 40px 아이콘 타일 + label-lg 라벨 + heading-lg 값, r20 카드.
 * 공용 InitialTile은 44px·r14라 여기서 직접 그린다. 시안 타일 안 글자는 값 첫 자리(자리표시자)라 아이콘으로 대체.
 */
export function RecordStatCard({ icon: Icon, tone, label, value }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-[20px] border bg-card px-[18px] py-4">
      <span
        aria-hidden
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl text-label-lg",
          TONE_CLASS[tone],
        )}
      >
        <Icon className="size-5" strokeWidth={2} />
      </span>
      <div className="flex flex-col gap-1">
        <span className="text-label-lg text-muted-foreground">{label}</span>
        <span className="text-heading-lg text-ink">{value}</span>
      </div>
    </div>
  );
}
