"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/common/brand-logo";
import { getRoute, SIDEBAR_NAV } from "@/config/routes";
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
};

/** 회원·관리자 레이아웃 좌측 내비게이션(디자인 W-01·C-02 v2 사이드바). routes.ts의 SIDEBAR_NAV를 읽어 그린다. */
export function RoleSidebar({ nav, user }: Props) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col gap-1 border-r bg-sidebar px-3.5 pt-6 pb-5">
      <BrandLogo className="mb-5 pl-2.5" />
      <nav className="flex flex-col gap-1">
        {SIDEBAR_NAV[nav].map((item) => {
          const r = getRoute(item.path);
          const active = isActive(pathname, r.path);
          return (
            <Link
              key={r.path}
              href={r.sample}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-[14px] px-3.5 py-[11px] text-label-lg transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
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

/** 동적 세그먼트([code] 등)를 가진 path 패턴과 실제 pathname을 대조한다. */
function isActive(pathname: string, pattern: string): boolean {
  const re = new RegExp("^" + pattern.replace(/\[[^\]]+\]/g, "[^/]+") + "$");
  return re.test(pathname);
}
