import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StatusTone = "live" | "ended" | "paid" | "free" | "topic" | "default";

const TONE_CLASS: Record<StatusTone, string> = {
  /** 진행 중 — mint 배경 흰 글자 */
  live: "bg-mint text-white",
  /** 종료 — muted */
  ended: "bg-muted text-muted-foreground",
  /** ₩ 유료 — 주황 */
  paid: "bg-orange-soft text-orange",
  /** 무료 */
  free: "bg-muted text-muted-foreground",
  /** 주제 칩(백엔드·CS 면접 …) — mint-bg */
  topic: "bg-mint-bg text-mint-dark",
  default: "bg-mint-tint text-mint-dark",
};

type Props = {
  tone?: StatusTone;
  /** md: label-md · padding [3,8] (기본) · lg: label-lg · padding [4,10] */
  size?: "md" | "lg";
  children: ReactNode;
  className?: string;
};

/** 알약 상태 칩 — 진행 중/종료/₩ 유료/무료/주제. 홈 카드·내가 만든 방·결제 화면 공통 */
export function StatusChip({ tone = "default", size = "md", children, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full whitespace-nowrap",
        size === "md" ? "px-2 py-[3px] text-label-md" : "px-2.5 py-1 text-label-lg",
        TONE_CLASS[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
