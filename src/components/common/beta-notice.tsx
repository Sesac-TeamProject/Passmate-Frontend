import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  children: ReactNode;
  className?: string;
};

/**
 * 베타 안내 배너 (Figma "13 · 베타 운영") — BETA 칩 + 제목 한 줄 + 설명.
 * 잠긴 버튼 **바로 위**에 둔다: 왜 안 눌리는지를 버튼보다 먼저 읽어야 한다.
 */
export function BetaNotice({ title, children, className }: Props) {
  return (
    <div
      role="note"
      className={cn("flex flex-col gap-1 rounded-xl bg-mint-bg px-3.5 py-3", className)}
    >
      <p className="flex items-center gap-2">
        <span className="rounded-full bg-mint px-2 py-0.5 text-[10px] leading-[14px] font-bold tracking-wide text-white">
          BETA
        </span>
        <span className="text-label-lg font-bold text-ink">{title}</span>
      </p>
      <p className="text-label-md text-muted-foreground">{children}</p>
    </div>
  );
}
