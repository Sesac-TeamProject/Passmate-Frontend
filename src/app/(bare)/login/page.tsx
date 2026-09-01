"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { ScreenLoading } from "@/components/common/screen-loading";
import { LoginPage } from "@/features/auth/login-page";
import { safeNextPath } from "@/lib/safe-next";
import { useAuthStore } from "@/lib/stores/auth-store";

/**
 * C-01 컨테이너. 이메일 로그인은 API 명세서 v2에서 보류로 확정돼 Google 하나만 남는다.
 */
function LoginContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = useAuthStore((s) => s.status);
  const next = safeNextPath(searchParams.get("next"));

  useEffect(() => {
    if (status === "authenticated") router.replace(next);
  }, [status, next, router]);

  const handleGoogleClick = () => {
    // TODO(설정): GIS 클라이언트 ID를 받으면 여기서 idToken을 받아
    // socialLogin("google", { idToken })를 부르고 토큰을 저장한다.
    // 명세 v2에 서버 리다이렉트 진입점이 없어(POST /auth/login/{provider} 토큰 교환 방식)
    // 그때까지는 누를 곳이 없다.
  };

  return <LoginPage onGoogleClick={handleGoogleClick} />;
}

export default function Page() {
  return (
    <Suspense fallback={<ScreenLoading />}>
      <LoginContainer />
    </Suspense>
  );
}
