import Link from "next/link";
import { cn } from "@/lib/utils";

export type HubAction = {
  label: string;
  /** 카드 두 번째 줄. 없으면 라벨만 가운데로 놓는다 (새 방 만들기) */
  hint?: string;
  href: string;
  primary?: boolean;
};

type Props = { actions: HubAction[] };

/** W-09 오른쪽 행동 카드 — 새 방 만들기 · 진행 중인 방 열기 · 종료된 방 리포트 (시안 803:8821~8831) */
export function HubActions({ actions }: Props) {
  return (
    <nav aria-label="방 바로가기" className="flex w-85 shrink-0 flex-col gap-[11px]">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className={cn(
            "flex h-24 items-center justify-between rounded-[14px] px-6 transition-colors",
            action.primary
              ? "bg-mint text-white hover:bg-mint-dark"
              : "border bg-card hover:bg-muted",
          )}
        >
          <span className="flex min-w-0 flex-col gap-1.5">
            <span className={cn("truncate text-heading-sm", !action.primary && "text-ink")}>
              {action.label}
            </span>
            {action.hint !== undefined && (
              <span className="truncate text-label-md text-muted-foreground">{action.hint}</span>
            )}
          </span>
          <span
            aria-hidden
            className={cn("text-heading-md", action.primary ? "text-white" : "text-ink-disabled")}
          >
            ›
          </span>
        </Link>
      ))}
    </nav>
  );
}
