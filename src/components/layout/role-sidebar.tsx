"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/common/brand-logo";
import { ROLE_LABEL, routesByRole, type Role } from "@/config/routes";
import { cn } from "@/lib/utils";

type Props = {
  role: Role;
  /** 하단 프로필. 데이터 연동 전까지는 레이아웃에서 목업을 넘긴다. */
  user: { name: string; initial: string };
};

/** 선생님·관리자 레이아웃 좌측 내비게이션(디자인 W-01 사이드바). routes.ts에서 해당 역할 라우트를 읽어 그린다. */
export function RoleSidebar({ role, user }: Props) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col gap-1 border-r bg-sidebar px-3.5 pt-6 pb-5">
      <BrandLogo className="mb-5 pl-2.5" />
      <nav className="flex flex-col gap-1">
        {routesByRole(role).map((r) => {
          const active = isActive(pathname, r.path);
          return (
            <Link
              key={r.path}
              href={r.sample}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-[14px] px-3.5 py-[11px] text-sm font-bold transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              {r.title}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex items-center gap-2.5 pl-2.5">
        <span className="flex size-8 items-center justify-center rounded-full bg-[#f8c6a4] text-[13px] font-black text-[#7a3a11]">
          {user.initial}
        </span>
        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-ink">{user.name}</span>
          <span className="text-[11px] text-muted-foreground">{ROLE_LABEL[role]}</span>
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
