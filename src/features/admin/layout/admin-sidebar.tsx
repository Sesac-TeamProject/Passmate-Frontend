"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { routesByRole } from "@/config/routes";

/** 로그인한 운영자. 계정 연동 전까지 고정값. */
const OPERATOR = { name: "이한결", role: "운영 관리자" };

/**
 * 사이드바에 쓰는 짧은 라벨. 시안(A-01~A-06)이 라우트 제목보다 짧게 쓴다.
 * routes.ts는 화면 제목의 단일 출처라 그대로 두고, 표시 라벨만 여기서 덮는다.
 */
const NAV_LABEL: Record<string, string> = {
  "/admin/reports": "신고 · 제재",
  "/admin/branded": "광고 · 브랜디드",
};

/**
 * 관리자 전용 좌측 내비게이션 (A-01~A-06 공통).
 * 항목은 routes.ts의 admin 라우트에서만 읽는다.
 * 선생님·회원용 RoleSidebar는 라이트 테마라 여기서는 쓰지 않는다.
 */
export function AdminSidebar() {
  const pathname = usePathname();
  const items = routesByRole("admin");

  return (
    <aside className="flex w-[236px] shrink-0 flex-col gap-[6px] bg-[#221e38] px-4 pt-[22px] pb-5">
      <div className="flex shrink-0 items-center gap-2 pb-[18px] pl-[10px]">
        <Image src="/admin/brand-dot.svg" alt="" width={22} height={22} className="size-[22px]" />
        <p className="text-[15px] leading-[1.2] font-black text-white">패스메이트</p>
        <span className="rounded-[6px] bg-[#332c52] px-2 py-[3px] text-[10px] leading-[1.2] font-bold text-[#0e8a63]">
          ADMIN
        </span>
      </div>

      <nav className="flex flex-col gap-[6px]">
        {items.map((route) => {
          const active = pathname === route.sample;
          return (
            <Link
              key={route.path}
              href={route.sample}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex w-full items-center gap-[10px] rounded-[9px] px-3 py-[9px] text-[12.5px] leading-[1.3]",
                active
                  ? "bg-[#17b884] font-bold text-white"
                  : "font-medium text-[#0e8a63] hover:bg-white/5",
              )}
            >
              <Image
                src={active ? "/admin/nav-dot-active.svg" : "/admin/nav-dot.svg"}
                alt=""
                width={6}
                height={6}
                className="size-[6px] shrink-0"
              />
              {NAV_LABEL[route.path] ?? route.title}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <div className="flex w-full shrink-0 items-center gap-[9px] pt-3 pl-[10px]">
        <Image src="/admin/avatar.svg" alt="" width={26} height={26} className="size-[26px]" />
        <div className="flex flex-col gap-px">
          <p className="text-[12px] leading-[1.2] font-bold text-white">{OPERATOR.name}</p>
          <p className="text-[10px] leading-[1.2] text-[#84828c]">{OPERATOR.role}</p>
        </div>
      </div>
    </aside>
  );
}
