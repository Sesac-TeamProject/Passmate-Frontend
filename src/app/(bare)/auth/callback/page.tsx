"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { LoginFailed } from "@/features/auth/login-failed";
import { LoginProgress } from "@/features/auth/login-progress";
import { socialLogin } from "@/lib/api/auth";
import { safeNextPath } from "@/lib/safe-next";
import { useAuthStore } from "@/lib/stores/auth-store";
import { clearRefreshToken, writeRefreshToken } from "@/lib/token-storage";
import type { MeResponse } from "@/lib/types/dto";

/**
 * 소셜 로그인 콜백 — `/auth/callback?code=&next=`.
 *
 * API 명세서 v2에는 서버가 토큰을 쿼리로 돌려주는 리다이렉트 콜백이 없다.
 * 서버는 `POST /auth/login/{provider}`로 인가 코드를 받아 토큰을 내주는 **토큰 교환** 방식이다.
 * 그래서 이 화면은 인가 코드를 받아 그 API를 부르는 역할만 한다.
 *
 * GIS 클라이언트 ID를 아직 못 받아 **실제 동작은 확인되지 않았다**(DESIGN_GAPS D-1).
 */
function CallbackClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [failed, setFailed] = useState(false);

  const code = params.get("code");
  const next = safeNextPath(params.get("next"));
  // 코드가 없으면 렌더 시점에 바로 실패로 보여준다 — effect 안에서 동기 setState를 하지 않기 위해.
  const missingCode = !code;

  useEffect(() => {
    if (!code) return;

    socialLogin("google", {
      authorizationCode: code,
      redirectUri: `${window.location.origin}/auth/callback`,
    })
      .then((res) => {
        writeRefreshToken(res.refreshToken);
        // 서버가 GET /users/me를 아직 안 만들어 로그인 응답의 user를 그대로 프로필로 쓴다.
        const profile: MeResponse = {
          userId: res.user.id,
          name: res.user.nickname,
          nickname: res.user.nickname,
          email: res.user.email,
          isAdmin: res.user.isAdmin,
        };
        useAuthStore.getState().setSession(res.accessToken, profile);
        router.replace(next);
      })
      .catch(() => {
        // 실패한 채로 토큰이 남으면 status는 authenticated가 아닌데 요청에 계속 붙는다 — 반드시 정리한다.
        useAuthStore.getState().clearSession();
        clearRefreshToken();
        setFailed(true);
      });
  }, [code, next, router]);

  // 인가 코드가 아예 없으면 사용자가 구글 화면에서 취소한 것, 있는데 실패면 교환이 깨진 것이다
  if (missingCode || failed)
    return (
      <LoginFailed
        reason={missingCode ? "canceled" : "failed"}
        onRetry={() => router.replace("/login")}
      />
    );
  return <LoginProgress />;
}

// useSearchParams()는 App Router에서 Suspense 경계가 필요하다(없으면 next build 실패).
export default function Page() {
  return (
    <Suspense fallback={<LoginProgress />}>
      <CallbackClient />
    </Suspense>
  );
}
