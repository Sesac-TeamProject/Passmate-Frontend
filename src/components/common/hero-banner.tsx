import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description: string;
  /** 우측 액션(버튼·링크). 없으면 제목만 */
  action?: ReactNode;
  className?: string;
};

/** 민트 배경 페이지 배너 (디자인 W-01 v6 홈·W-09 내가 만든 방·W-10 정산 공통). r24 · padding [20,32] (시안 26 — 첫 화면 높이를 줄이려 조임) */
export function HeroBanner({ title, description, action, className }: Props) {
  return (
    <section
      className={cn(
        "flex items-center justify-between rounded-3xl bg-mint-bg px-8 py-5",
        className,
      )}
    >
      <div className="flex flex-col gap-1.5">
        <h1 className="text-heading-lg text-mint-ink">{title}</h1>
        <p className="text-label-lg text-mint-ink-secondary">{description}</p>
      </div>
      {action}
    </section>
  );
}
