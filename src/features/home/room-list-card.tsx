import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  /** 헤더 우측 링크 (빈 상태에서는 숨김) */
  moreHref?: string;
  moreLabel?: string;
  /** 행 목록 (행 사이 1px divider) */
  children?: ReactNode;
  /** 데이터가 없을 때 대신 그릴 내용 — 주어지면 헤더 링크를 숨기고 가운데 정렬 */
  empty?: ReactNode;
  className?: string;
};

/** 홈 2열 카드 (최근 참여한 방 · 내가 만든 방) — r16 · padding [18,20] · 헤더 heading-sm + label-md 링크 */
export function RoomListCard({ title, moreHref, moreLabel, children, empty, className }: Props) {
  const isEmpty = empty !== undefined;
  return (
    <section
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-3 rounded-2xl border bg-card px-5 py-[18px]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-heading-sm text-ink">{title}</h2>
        {!isEmpty && moreHref && moreLabel && (
          <Link href={moreHref} className="text-label-md text-mint-dark hover:underline">
            {moreLabel}
          </Link>
        )}
      </div>
      {isEmpty ? (
        <div className="flex flex-col items-center gap-2 pt-2 pb-1 text-center">{empty}</div>
      ) : (
        <div className="flex flex-col gap-3">{children}</div>
      )}
    </section>
  );
}

type RowProps = {
  /** 좌측 칩 (순위 · 상태) */
  leading: ReactNode;
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
};

/** 카드 안 한 행 — 칩 + [제목 / 설명] + 우측 링크. 행 사이 1px divider */
export function RoomListRow({ leading, title, description, actionHref, actionLabel }: RowProps) {
  return (
    <div className="flex items-center justify-between gap-3 not-first:border-t not-first:border-border not-first:pt-3">
      <div className="flex min-w-0 items-center gap-3">
        {leading}
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="truncate text-label-lg text-ink">{title}</p>
          <p className="truncate text-label-md text-muted-foreground">{description}</p>
        </div>
      </div>
      <Link href={actionHref} className="shrink-0 text-label-md text-mint-dark hover:underline">
        {actionLabel}
      </Link>
    </div>
  );
}
