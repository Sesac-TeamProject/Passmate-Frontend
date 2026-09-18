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

/**
 * 방 만들기 플로우(W-02·W-03) 상단바. 사이드바 없는 전체 화면에서 쓴다.
 *
 * 폰에서는 높이를 풀고 줄바꿈을 허용한다 — 68px 한 줄에 제목 · 칩 · 버튼 둘을 밀어 넣으면
 * 390 을 넘겨 화면 전체가 가로로 흐른다. 마크업을 두 벌 만들지 않고 한 벌이 접히게 둔다.
 */
export function FlowTopBar({ backHref, title, badge, children }: Props) {
  return (
    <header className="flex h-[68px] shrink-0 items-center justify-between border-b bg-card px-8 max-md:h-auto max-md:flex-wrap max-md:gap-x-3 max-md:gap-y-2 max-md:px-5 max-md:py-3">
      <div className="flex min-w-0 items-center gap-3 max-md:flex-wrap max-md:gap-x-2">
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
