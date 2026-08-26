import { cn } from "@/lib/utils";
import { TONE_CHIP, type Tone } from "./tone";

type Props = {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
};

/** 지표·상태에 붙는 작은 알약 라벨. KPI 증감, 처리 상태, 시스템 상태에 공통으로 쓴다. */
export function StatChip({ children, tone = "neutral", className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-[6px] px-2 py-[3px] text-[10px] leading-[1.2] font-bold whitespace-nowrap",
        TONE_CHIP[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
