"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { Button } from "@/components/ui/button";
import { useRestoreSession } from "@/lib/queries/use-restore-session";
import { useAuthStore } from "@/lib/stores/auth-store";
import { AppError } from "@/lib/types/app-error";
import type { UserRole } from "@/lib/types/dto";

const LOGIN_PATH = "/login";
const HOME_PATH = "/";

type Props = {
  /** 지정하면 프로필 role까지 확인한다. 예: /admin/* 은 "ADMIN" */
  role?: UserRole;
  children: React.ReactNode;
};

/**
 * 라우트 가드 (규칙 문서 §2-1, §8). 미로그인은 `/login?next=` 로 보내고,
 * role 불일치는 권한 거부 화면을 보인다. UX용 가드이며 최종 권위는 서버 403이다.
 */
export function RequireAuth({ role, children }: Props) {
  const status = useRestoreSession();
  const profile = useAuthStore((s) => s.profile);
  const router = useRouter();
  const pathname = usePathname();

  const isUnauthenticated = status === "unauthenticated";
  const isAuthenticated = status === "authenticated";
  const hasRole = !role || profile?.role === role;

  useEffect(() => {
    if (isUnauthenticated) {
      router.replace(`${LOGIN_PATH}?next=${encodeURIComponent(pathname)}`);
    }
  }, [isUnauthenticated, pathname, router]);

  if (!isAuthenticated) return <ScreenLoading />;
  if (!hasRole) {
    return (
      <ScreenError message={new AppError("PermissionDenied").message}>
        <Button variant="outline" render={<Link href={HOME_PATH} />}>
          홈으로
        </Button>
      </ScreenError>
    );
  }

  return <>{children}</>;
}
