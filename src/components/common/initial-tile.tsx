import { cn } from "@/lib/utils";

export type TileTone = "mint" | "blue" | "orange" | "gray";

const TONE_CLASS: Record<TileTone, string> = {
  mint: "bg-muted text-mint-dark",
  blue: "bg-blue-soft text-blue",
  orange: "bg-orange-soft text-orange",
  gray: "bg-muted text-muted-foreground",
};

type Props = {
  /** 타일 안에 들어갈 1~2글자. 예: "P", "Sp", "CS" */
  label: string;
  tone?: TileTone;
  className?: string;
};

/** 44px 정사각 이니셜 타일. 통계 카드·문제 세트 카드 등 목록 항목의 아이콘 자리. */
export function InitialTile({ label, tone = "mint", className }: Props) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-[14px] text-heading-sm",
        TONE_CLASS[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
