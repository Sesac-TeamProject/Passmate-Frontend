"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScreenLoading } from "@/components/common/screen-loading";
import { LoginPage } from "@/features/auth/login-page";
import { IS_MOCK } from "@/lib/env";
import { useDevLogin } from "@/lib/queries/use-auth";
import { safeNextPath } from "@/lib/safe-next";
import { useAuthStore } from "@/lib/stores/auth-store";
import { AppError } from "@/lib/types/app-error";

/**
 * C-01 컨테이너. 이메일 로그인은 API 명세서 v2에서 보류로 확정돼 Google 하나만 남는다.
 *
 * 개발용 로그인(`POST /auth/dev-login`)은 **실서버에 붙었을 때만** 노출한다 —
 * 목 모드는 이미 자동 로그인이라 겹치고, 운영 프로파일에는 이 API가 없어 404가 난다.
 */
function LoginContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = useAuthStore((s) => s.status);
  const next = safeNextPath(searchParams.get("next"));

  const devLogin = useDevLogin();
  const [devKey, setDevKey] = useState("");

  useEffect(() => {
    if (status === "authenticated") router.replace(next);
  }, [status, next, router]);

  const handleGoogleClick = () => {
    // TODO(설정): GIS 클라이언트 ID를 받으면 여기서 idToken을 받아
    // socialLogin("google", { idToken })를 부르고 토큰을 저장한다(research.md R-10).
    // 명세 v2에 서버 리다이렉트 진입점이 없어(POST /auth/login/{provider} 토큰 교환 방식)
    // 그때까지는 누를 곳이 없다.
  };

  const handleDevSubmit = () => {
    if (devLogin.isPending) return;
    devLogin.mutate({ key: devKey.trim() }, { onSuccess: () => router.replace(next) });
  };

  return (
    <LoginPage
      onGoogleClick={handleGoogleClick}
      devLogin={
        IS_MOCK
          ? undefined
          : {
              value: devKey,
              onChange: setDevKey,
              onSubmit: handleDevSubmit,
              pending: devLogin.isPending,
              errorMessage: devLogin.isError ? toDevLoginMessage(devLogin.error) : null,
            }
      }
    />
  );
}

/** 404는 "이 서버에는 없는 기능"이다 — 개발용 로그인은 운영 프로파일에 등록되지 않는다 */
function toDevLoginMessage(error: unknown): string {
  if (AppError.isAppError(error) && error.kind === "NotFound")
    return "이 서버에는 개발용 로그인이 없어요. 로컬·dev 백엔드에서만 쓸 수 있어요.";
  if (AppError.isAppError(error)) return error.message;
  return "로그인하지 못했어요. 잠시 후 다시 시도해 주세요.";
}

export default function Page() {
  return (
    <Suspense fallback={<ScreenLoading />}>
      <LoginContainer />
    </Suspense>
  );
}
