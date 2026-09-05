"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/common/brand-logo";
import { useAuthStore } from "@/lib/stores/auth-store";

/**
 * 공통·학생 화면 상단 헤더. 선생님·관리자 화면은 사이드바 레이아웃을 쓰므로 렌더하지 않는다.
 *
 * 시안은 로고 왼쪽 · "로그인" 오른쪽이다. 이미 로그인한 사람에게 "로그인"을 보이면 거짓말이라
 * 그때는 홈으로 가는 링크로 바꾼다. 복원 중(`idle`·`restoring`)에는 어느 쪽도 아직 모르므로
 * 자리를 비워 둔다 — 잠깐 "로그인"이 떴다 사라지는 깜빡임을 막는다.
 */
export function SiteHeader() {
  const status = useAuthStore((s) => s.status);

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <BrandLogo />
        {status === "unauthenticated" && (
          <Link
            href="/login"
            className="flex h-9 items-center rounded-full bg-mint-tint px-4 text-label-lg text-mint-dark transition-colors hover:bg-mint hover:text-white"
          >
            로그인
          </Link>
        )}
        {status === "authenticated" && (
          <Link href="/home" className="text-label-lg text-mint-dark hover:underline">
            내 화면으로 →
          </Link>
        )}
      </div>
    </header>
  );
}
