import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  backHref: string;
  title: string;
  /** 제목 옆 작은 칩. 예: "문제 세트 › 수정하기" */
  badge?: string;
  /** 우측 슬롯 — 액션 버튼 또는 안내문 */
  children?: ReactNode;
};

/** 방 만들기 플로우(W-02·W-03) 상단바. 사이드바 없는 전체 화면에서 쓴다. */
export function FlowTopBar({ backHref, title, badge, children }: Props) {
  return (
    <header className="flex h-[68px] shrink-0 items-center justify-between border-b bg-card px-8">
      <div className="flex items-center gap-3">
        <Link href={backHref} aria-label="뒤로" className="text-heading-sm text-muted-foreground">
          ←
        </Link>
        <h1 className="text-heading-sm text-ink">{title}</h1>
        {badge && (
          <span className="rounded-full bg-muted px-2.5 py-1 text-label-lg text-muted-foreground">
            {badge}
          </span>
        )}
      </div>
      {children && <div className="flex items-center gap-2.5">{children}</div>}
    </header>
  );
}
