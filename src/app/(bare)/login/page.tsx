"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScreenLoading } from "@/components/common/screen-loading";
import { GoogleLoginButton } from "@/features/auth/google-login-button";
import { LoginFailed } from "@/features/auth/login-failed";
import { LoginPage } from "@/features/auth/login-page";
import { LoginProgress } from "@/features/auth/login-progress";
import { getMe, socialLogin } from "@/lib/api/auth";
import { ENABLE_DEV_LOGIN, IS_MOCK } from "@/lib/env";
import { useDevLogin } from "@/lib/queries/use-auth";
import { safeNextPath } from "@/lib/safe-next";
import { useAuthStore } from "@/lib/stores/auth-store";
import { clearRefreshToken, writeRefreshToken } from "@/lib/token-storage";
import { AppError } from "@/lib/types/app-error";

/**
 * C-01 컨테이너. 이메일 로그인은 API 명세서 v2에서 보류로 확정돼 Google 하나만 남는다.
 *
 * Google 로그인은 **GIS idToken 방식** — 버튼(GoogleLoginButton)이 ID 토큰을 받아 오면
 * 여기서 `POST /auth/login/google`로 교환한다. 리다이렉트 없이 같은 화면에서 끝나므로
 * 만료 화면이 붙여 준 `next`가 그대로 살아 있다. 교환 중·실패 화면은
 * auth/callback(인가 코드 플로우)과 같은 C-01a·C-01b를 쓴다.
 *
 * 개발용 로그인(`POST /auth/dev-login`)은 **NEXT_PUBLIC_ENABLE_DEV_LOGIN=1 일 때만** 노출한다 —
 * 목 모드는 이미 자동 로그인이라 겹치고, 운영 프로파일에는 이 API가 없어 404가 난다.
 * 운영 배포(main)는 이 값을 켜지 않아 패널이 아예 그려지지 않는다.
 */
function LoginContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = useAuthStore((s) => s.status);
  const next = safeNextPath(searchParams.get("next"));

  const devLogin = useDevLogin();
  const [devKey, setDevKey] = useState("");
  const [googlePhase, setGooglePhase] = useState<"idle" | "exchanging" | "failed">("idle");

  useEffect(() => {
    if (status === "authenticated") router.replace(next);
  }, [status, next, router]);

  const handleIdToken = useCallback(
    (idToken: string) => {
      setGooglePhase("exchanging");
      socialLogin("google", { idToken })
        .then(async (res) => {
          writeRefreshToken(res.refreshToken);
          // 액세스 토큰을 먼저 스토어에 넣어야 이어지는 GET /users/me에 Authorization이 붙는다.
          useAuthStore.getState().setAccessToken(res.accessToken);
          // 로그인 응답의 user(UserSummary)에는 지표·코인·가입일이 없다 — 프로필은 GET /users/me가 원천이다.
          const profile = await getMe();
          useAuthStore.getState().setSession(res.accessToken, profile);
          router.replace(next);
        })
        .catch(() => {
          // 실패한 채 토큰이 남으면 요청에 계속 붙는다 — auth/callback과 똑같이 반드시 정리한다.
          useAuthStore.getState().clearSession();
          clearRefreshToken();
          setGooglePhase("failed");
        });
    },
    [next, router],
  );

  const handleDevSubmit = () => {
    if (devLogin.isPending) return;
    devLogin.mutate({ key: devKey.trim() }, { onSuccess: () => router.replace(next) });
  };

  if (googlePhase === "exchanging") return <LoginProgress />;
  if (googlePhase === "failed")
    return <LoginFailed reason="failed" onRetry={() => setGooglePhase("idle")} />;

  return (
    <LoginPage
      googleButton={<GoogleLoginButton onIdToken={handleIdToken} />}
      devLogin={
        IS_MOCK || !ENABLE_DEV_LOGIN
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
