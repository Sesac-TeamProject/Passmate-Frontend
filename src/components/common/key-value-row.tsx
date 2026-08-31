import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  label: ReactNode;
  value: ReactNode;
  /** 값 강조 — 합계·정산액 등 */
  emphasis?: boolean;
  className?: string;
};

/** 좌 라벨(label-md 회색) / 우 값(label-lg ink) 한 줄. 방 정보·코인 요약·영수증·합계 공통 */
export function KeyValueRow({ label, value, emphasis, className }: Props) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <span
        className={cn(emphasis ? "text-label-lg text-ink" : "text-label-md text-muted-foreground")}
      >
        {label}
      </span>
      <span className={cn(emphasis ? "text-heading-md text-ink" : "text-label-lg text-ink")}>
        {value}
      </span>
    </div>
  );
}
