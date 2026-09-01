"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ScreenLoading } from "@/components/common/screen-loading";
import { LoginPage, type LoginValues } from "@/features/auth/login-page";
import { safeNextPath } from "@/lib/safe-next";
import { useAuthStore } from "@/lib/stores/auth-store";

const INITIAL_VALUES: LoginValues = { email: "", password: "", remember: false };

/** C-01 v2 컨테이너. 폼 상태·제출을 소유하고 렌더는 LoginPage에 맡긴다. */
function LoginContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = useAuthStore((s) => s.status);
  const [values, setValues] = useState<LoginValues>(INITIAL_VALUES);
  const [pending, setPending] = useState(false);
  const next = safeNextPath(searchParams.get("next"));

  useEffect(() => {
    if (status === "authenticated") router.replace(next);
  }, [status, next, router]);

  const handleSubmit = () => {
    // TODO(API): 이메일 로그인 계약 없음 — DESIGN_GAPS C-1 결정 대기
    setPending(true);
    router.push("/home");
  };

  const handleGoogleClick = () => {
    // TODO(설정): GIS 클라이언트 ID를 받으면 여기서 idToken을 받아
    // socialLogin("google", { idToken })를 부르고 토큰을 저장한다.
    // 명세 v2에 서버 리다이렉트 진입점이 없어(POST /auth/login/{provider} 토큰 교환 방식)
    // 그때까지는 누를 곳이 없다. 로그인 화면 정리는 다음 커밋(C-01)에서 한다.
  };

  return (
    <LoginPage
      values={values}
      onChange={setValues}
      onSubmit={handleSubmit}
      pending={pending}
      onGoogleClick={handleGoogleClick}
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={<ScreenLoading />}>
      <LoginContainer />
    </Suspense>
  );
}
