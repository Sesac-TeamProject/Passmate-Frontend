"use client";

import { Fragment, type ReactNode, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DoorOpen, Home, SquarePlus, User, type LucideIcon } from "lucide-react";
import { findActivePath } from "@/components/layout/active-path";
import { getRoute, matchRoute, MOBILE_TABS } from "@/config/routes";
import { cn } from "@/lib/utils";

/**
 * 탭바가 먹는 높이(안전영역 제외). 본문 아래 여백과 MobileActionBar 위치가 이 값을 함께 쓰므로
 * 숫자를 화면마다 적지 않고 여기 한 곳에 둔다.
 * 구분선 1 + 위 10 + 아이콘 24 + 간격 4 + 라벨 줄 17 + 항목 위아래 4·2 = 64
 */
export const MOBILE_TAB_BAR_H = "64px";

/** 시안 v6 nav/4탭 아이콘 — 앱 `PassmateIcons`의 Home·PlusSquare·DoorOpen·User와 1:1 */
const ICONS: Record<(typeof MOBILE_TABS)[number]["icon"], LucideIcon> = {
  home: Home,
  hosted: SquarePlus,
  joined: DoorOpen,
  me: User,
};

// 앱 탭바는 남는 폭을 바깥 6 : 사이 5 로 나눈다 — 라벨 길이가 달라도 비율이 유지된다
const OUTER_GAP = "grow-[6]";
const INNER_GAP = "grow-[5]";

/** 탭바를 그리는 화면인지 — 탭바와 본문 여백이 같은 조건을 봐야 한다 */
function useTabBarVisible() {
  const pathname = usePathname();
  return matchRoute(pathname)?.mobileBare !== true;
}

/**
 * 폰 폭(768px 미만) 하단 4탭 바 — 앱 `component/PassmateBottomTabBar.kt`를 옮긴 것.
 * PC는 사이드바가 같은 일을 하므로 **md 이상에서는 그리지 않는다.**
 * 앱이 탭바 없이 그리는 화면(routes.ts의 `mobileBare`)에서는 아무것도 그리지 않는다.
 */
export function MobileTabBar() {
  const pathname = usePathname();
  const visible = useTabBarVisible();
  if (!visible) return null;

  const activePath = findActivePath(
    pathname,
    MOBILE_TABS.map((tab) => tab.path),
  );

  return (
    <nav
      aria-label="주요 화면"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-card pt-2.5 pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <span className={OUTER_GAP} />
      {MOBILE_TABS.map((tab, index) => {
        const Icon = ICONS[tab.icon];
        const active = tab.path === activePath;
        return (
          <Fragment key={tab.path}>
            <Link
              href={getRoute(tab.path).sample}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 flex-col items-center gap-1 py-1 transition-colors",
                active ? "text-mint" : "text-muted-foreground",
              )}
            >
              <Icon className="size-6" strokeWidth={2} aria-hidden />
              <span className={cn("text-label-md", active && "font-bold")}>{tab.label}</span>
            </Link>
            <span className={index === MOBILE_TABS.length - 1 ? OUTER_GAP : INNER_GAP} />
          </Fragment>
        );
      })}
    </nav>
  );
}

/**
 * 탭바가 서는 화면의 본문 감싸개. 탭바가 fixed라 자리를 먹지 않으므로 본문 끝이 가리지 않게 띄우고,
 * 탭바 높이를 CSS 변수로 내려보낸다(아래 버튼 줄·FAB이 같은 값을 읽는다).
 * 탭바를 그리지 않는 화면(mobileBare)에서는 여백도 주지 않는다 — 결제 화면 아래에 빈자리가 남는다.
 */
export function MobileTabBarInset({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const visible = useTabBarVisible();
  return (
    <div
      className={cn(className, visible && "max-md:pb-[var(--mobile-tab-bar-h)]")}
      style={{ "--mobile-tab-bar-h": MOBILE_TAB_BAR_H } as CSSProperties}
    >
      {children}
    </div>
  );
}
