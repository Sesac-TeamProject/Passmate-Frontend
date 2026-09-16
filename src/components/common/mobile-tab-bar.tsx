"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DoorOpen, Home, SquarePlus, User } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 앱 하단 탭 4개 (시안 v6 `03 · 앱` 섹션의 탭 묶음 — M-13 384:5173).
 *
 * 폰에는 사이드바(`role-sidebar`, 240px)를 놓을 자리가 없다. 사이드바를 숨기기만 하면
 * 회원이 화면 사이를 오갈 길이 사라지므로, 시안이 정한 이 네 탭이 그 자리를 대신한다.
 * 사이드바는 5개(문제 세트 포함)지만 탭은 4개다 — 문제 세트는 방 만들기 흐름에서 들어간다.
 *
 * `MobileActionBar`와 같은 `sticky bottom-0 + mt-auto`를 쓴다. 부모가 `min-h-dvh flex-col`이어야
 * 내용이 짧을 때 화면 맨 아래에 붙는다.
 */
const TABS = [
  { href: "/home", label: "홈", Icon: Home },
  { href: "/host/rooms", label: "내가 만든 방", Icon: SquarePlus },
  { href: "/me/joined", label: "참여한 방", Icon: DoorOpen },
  { href: "/me", label: "마이", Icon: User },
] as const;

type Props = {
  /** 경로로 판정하지 않고 직접 켤 탭. 목록 화면이 아닌 하위 화면에서 쓴다 */
  activeHref?: string;
  className?: string;
};

export function MobileTabBar({ activeHref, className }: Props) {
  const pathname = usePathname();

  // `/me`가 `/me/joined`의 앞부분이라 앞글자 비교만 하면 두 탭이 같이 켜진다 — 가장 긴 것 하나만 고른다
  const current = activeHref ?? pathname;
  const active = TABS.map((t) => t.href)
    .filter((href) => current === href || current.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <nav
      aria-label="주요 메뉴"
      className={cn(
        "sticky bottom-0 z-30 mt-auto flex items-center justify-between border-t bg-card px-12 pt-2.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] shadow-[0_-2px_12px] shadow-ink/8 md:hidden",
        className,
      )}
    >
      {TABS.map(({ href, label, Icon }) => {
        const on = href === active;

        return (
          <Link
            key={href}
            href={href}
            aria-current={on ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-[5px] rounded-lg px-1 outline-none focus-visible:ring-2 focus-visible:ring-mint-dark",
              on ? "text-mint" : "text-muted-foreground",
            )}
          >
            <Icon size={24} strokeWidth={2} aria-hidden />
            <span className="text-label-lg">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
