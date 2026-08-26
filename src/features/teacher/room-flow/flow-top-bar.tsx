import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  backHref: string;
  title: string;
  /** 제목 옆 작은 칩. 예: "2/3 단계" */
  badge?: string;
  /** 우측 슬롯 — 스텝 표시 또는 액션 버튼 */
  children?: ReactNode;
};

/** 방 만들기 플로우(W-02·W-03) 상단바. 사이드바 없는 전체 화면에서 쓴다. */
export function FlowTopBar({ backHref, title, badge, children }: Props) {
  return (
    <header className="flex h-[68px] shrink-0 items-center justify-between border-b bg-card px-8">
      <div className="flex items-center gap-3">
        <Link href={backHref} aria-label="뒤로" className="font-bold text-muted-foreground">
          ←
        </Link>
        <h1 className="text-base font-black text-ink">{title}</h1>
        {badge && (
          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-black text-[#73727c]">
            {badge}
          </span>
        )}
      </div>
      {children && <div className="flex items-center gap-2.5">{children}</div>}
    </header>
  );
}
