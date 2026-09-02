"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/common/brand-logo";
import { getRoute, matchRoute, SIDEBAR_NAV } from "@/config/routes";
import { cn } from "@/lib/utils";

export type SidebarUser = {
  name: string;
  initial: string;
  /** 프로필 아래 작은 글씨. 예: "선생님", "회원" */
  roleLabel: string;
  tone?: keyof typeof AVATAR_TONE;
};

const AVATAR_TONE = {
  peach: "bg-avatar-peach text-avatar-peach-foreground",
  blue: "bg-choice-b text-choice-b-foreground",
} as const;

type Props = {
  nav: keyof typeof SIDEBAR_NAV;
  /** 하단 프로필. 데이터 연동 전까지는 레이아웃에서 목업을 넘긴다. */
  user: SidebarUser;
  /** 현재 URL 대신 강제로 활성 표시할 내비 path — 랜딩 목업처럼 라우트 밖에서 그릴 때 */
  activePath?: string;
};

/** 회원 레이아웃 좌측 내비게이션(디자인 웹 v6 사이드바 — 홈/내가 만든 방/참여한 방/문제 세트/마이페이지). routes.ts의 SIDEBAR_NAV를 읽어 그린다. */
export function RoleSidebar({ nav, user, activePath: forcedActivePath }: Props) {
  const pathname = usePathname();
  // 내비에 없는 화면(유료 방 결제 등)은 routes.ts의 nav 지정을 따른다
  const activePath =
    forcedActivePath ??
    findActivePath(
      pathname,
      SIDEBAR_NAV[nav].map((item) => item.path),
    ) ??
    matchRoute(pathname)?.nav;

  return (
    // 구분선은 border-r 대신 안쪽 그림자 — border는 240 폭을 먹어 내용 폭이 시안 212에서 211로 줄어든다
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col gap-1 bg-sidebar px-3.5 pt-6 pb-5 shadow-[inset_-1px_0_0_0_var(--color-border)]">
      <BrandLogo className="mb-5 pl-2.5" />
      <nav className="flex flex-col gap-1">
        {SIDEBAR_NAV[nav].map((item) => {
          const r = getRoute(item.path);
          const active = r.path === activePath;
          return (
            <Link
              key={r.path}
              href={r.sample}
              aria-current={active ? "page" : undefined}
              className={cn(
                // 높이는 시안 42 고정 — py로 두면 label-lg 행간(14×1.4=19.6)이 소수점이라 항목마다 0.4px씩 밀린다
                "flex h-[42px] items-center rounded-[14px] px-3.5 text-label-lg transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              {item.label ?? r.title}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex items-center gap-2.5 pl-2.5">
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-full text-label-lg",
            AVATAR_TONE[user.tone ?? "peach"],
          )}
        >
          {user.initial}
        </span>
        <div className="flex flex-col gap-px">
          <span className="text-label-lg text-ink">{user.name}</span>
          <span className="text-label-md text-muted-foreground">{user.roleLabel}</span>
        </div>
      </div>
    </aside>
  );
}

/**
 * 현재 pathname에 해당하는 내비 항목의 path. 정확히 일치하는 항목이 없으면 하위 경로(prefix)로 가장 긴 항목을 고른다
 * — /me/account 는 "마이페이지"(/me), /me/joined 는 자기 항목이 활성. 동적 세그먼트([code] 등)는 아무 값이나 허용.
 */
function findActivePath(pathname: string, patterns: readonly string[]): string | undefined {
  const toRegExp = (pattern: string, tail: string) =>
    new RegExp("^" + pattern.replace(/\[[^\]]+\]/g, "[^/]+") + tail);
  const exact = patterns.find((p) => toRegExp(p, "$").test(pathname));
  if (exact) return exact;
  return patterns
    .filter((p) => toRegExp(p, "/").test(pathname))
    .sort((a, b) => b.length - a.length)[0];
}
