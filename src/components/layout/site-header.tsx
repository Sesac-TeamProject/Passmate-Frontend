"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 전역 상단 헤더.
 * 관리자 화면(A-01~A-06)은 사이드바에 자체 브랜드 영역이 있고 시안에 헤더가 없어
 * /admin 이하에서는 렌더하지 않는다.
 */
export function SiteHeader() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="border-b">
      <div className="mx-auto flex h-12 max-w-6xl items-center px-4">
        <Link href="/" className="font-bold">
          PassMate
        </Link>
      </div>
    </header>
  );
}
