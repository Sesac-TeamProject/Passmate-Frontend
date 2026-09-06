"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { SessionExpired } from "@/components/common/session-expired";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
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
 * 라우트 가드 (규칙 문서 §2-1, §8). 미로그인은 `/login`으로 보내고(돌아올 곳은 붙이지 않는다 —
 * 로그인은 홈에서 시작한다), 관리자가 아니면 권한 거부 화면을 보인다.
 * 만료(E-401)만 `?next=`로 하던 자리를 들고 간다. UX용 가드이며 최종 권위는 서버 403이다.
 */
export function RequireAuth({ adminOnly, children }: Props) {
  const status = useRestoreSession();
  const profile = useAuthStore((s) => s.profile);
  const expired = useAuthStore((s) => s.expired);
  const router = useRouter();
  const pathname = usePathname();

  // 만료는 화면으로 알리고 사용자가 직접 누르게 한다 — 하던 일이 있었으니 말없이 튕기지 않는다.
  const isUnauthenticated = status === "unauthenticated" && !expired;
  const isAuthenticated = status === "authenticated";
  const hasRole = !adminOnly || profile?.isAdmin === true;

  /** 만료 화면에서만 쓴다 — 하던 일이 있던 사람은 그 자리로 돌려보낸다 */
  const loginHref = `${LOGIN_PATH}?next=${encodeURIComponent(pathname)}`;

  // 처음 로그인은 홈에서 시작한다. 미로그인으로 아무 화면에 들어왔다고 next를 붙이면
  // 로그인 직후 마지막에 열어 둔 화면(예: 마이페이지)이 떠서 홈이 아닌 곳에서 시작하게 된다.
  useEffect(() => {
    if (isUnauthenticated) router.replace(LOGIN_PATH);
  }, [isUnauthenticated, router]);

  // E-401 — 쓰던 도중에 끊긴 세션. 돌아올 곳을 next로 들고 간다.
  if (expired && status === "unauthenticated")
    return <SessionExpired onLogin={() => router.replace(loginHref)} />;

  // 로그인 판정 전 첫 페인트. 화면별 스켈레톤은 판정이 끝난 뒤 각 page가 그린다.
  if (!isAuthenticated) return <ScreenLoading />;
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
