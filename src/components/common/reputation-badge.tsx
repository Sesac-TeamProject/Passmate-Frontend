import { LevelEmblem } from "@/features/me/level-emblem";
import { cn } from "@/lib/utils";

type Props = {
  level: number;
  /** 레벨 칭호. 예: "검증된 운영자" */
  title: string;
  /** sm: 방 설정·프로필 칩 (padding [4,10,4,5]) · md: 내가 만든 방 레벨 카드 (padding [6,15,6,7.5]) */
  size?: "sm" | "md";
  className?: string;
};

/** 명성 뱃지 — 레벨 엠블럼 14px + "Lv.N 칭호". mint-tint 알약 */
export function ReputationBadge({ level, title, size = "sm", className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full bg-mint-tint text-label-lg text-mint-deep",
        size === "sm" ? "gap-1 py-1 pr-2.5 pl-[5px]" : "gap-1.5 py-1.5 pr-[15px] pl-2",
        className,
      )}
    >
      <LevelEmblem level={level} size={14} />
      Lv.{level} {title}
    </span>
  );
}
