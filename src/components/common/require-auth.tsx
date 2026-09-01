"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppBoot } from "@/components/common/app-boot";
import { ScreenError } from "@/components/common/screen-error";
import { Button } from "@/components/ui/button";
import { useRestoreSession } from "@/lib/queries/use-restore-session";
import { useAuthStore } from "@/lib/stores/auth-store";
import { AppError } from "@/lib/types/app-error";

const LOGIN_PATH = "/login";
const HOME_PATH = "/";

type Props = {
  /** 지정하면 관리자만 통과시킨다. 예: /admin/* */
  adminOnly?: boolean;
  children: React.ReactNode;
};

/**
 * 라우트 가드 (규칙 문서 §2-1, §8). 미로그인은 `/login?next=` 로 보내고,
 * 관리자가 아니면 권한 거부 화면을 보인다. UX용 가드이며 최종 권위는 서버 403이다.
 */
export function RequireAuth({ adminOnly, children }: Props) {
  const status = useRestoreSession();
  const profile = useAuthStore((s) => s.profile);
  const router = useRouter();
  const pathname = usePathname();

  const isUnauthenticated = status === "unauthenticated";
  const isAuthenticated = status === "authenticated";
  const hasRole = !adminOnly || profile?.isAdmin === true;

  useEffect(() => {
    if (isUnauthenticated) {
      router.replace(`${LOGIN_PATH}?next=${encodeURIComponent(pathname)}`);
    }
  }, [isUnauthenticated, pathname, router]);

  // 로그인 판정 전 첫 페인트 — W-00. 화면별 스켈레톤은 판정이 끝난 뒤 각 page가 그린다.
  if (!isAuthenticated) return <AppBoot />;
  if (!hasRole) {
    return (
      <ScreenError message={new AppError("PermissionDenied").message}>
        <Button variant="outline" nativeButton={false} render={<Link href={HOME_PATH} />}>
          홈으로
        </Button>
      </ScreenError>
    );
  }

  return <>{children}</>;
}
