"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ScreenLoading } from "@/components/common/screen-loading";
import { LoginPage, type LoginValues } from "@/features/auth/login-page";
import { googleLoginUrl } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth-store";

const INITIAL_VALUES: LoginValues = { email: "", password: "", remember: false };
const HOME_PATH = "/home";

/** C-01 v2 컨테이너. 폼 상태·제출을 소유하고 렌더는 LoginPage에 맡긴다. */
function LoginContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = useAuthStore((s) => s.status);
  const [values, setValues] = useState<LoginValues>(INITIAL_VALUES);
  const [pending, setPending] = useState(false);
  const next = searchParams.get("next") ?? HOME_PATH;

  useEffect(() => {
    if (status === "authenticated") router.replace(next);
  }, [status, next, router]);

  const handleSubmit = () => {
    // TODO(API): 이메일 로그인 계약 없음 — DESIGN_GAPS C-1 결정 대기
    setPending(true);
    router.push("/home");
  };

  const handleGoogleClick = () => {
    // 목 모드(NEXT_PUBLIC_API_BASE_URL 비어있음)에서는 API_BASE_URL이 빈 문자열이라
    // 이 링크가 같은 origin의 "/auth/oauth/google…"로 이동해 404가 난다 — 백엔드 연동 전까지는 정상(DESIGN_GAPS D-1).
    window.location.assign(googleLoginUrl(next));
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
