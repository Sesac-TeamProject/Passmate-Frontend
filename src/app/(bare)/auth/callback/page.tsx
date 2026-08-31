"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { getMe } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { writeRefreshToken } from "@/lib/token-storage";

const HOME_PATH = "/home";

/** /auth/callback?accessToken&refreshToken&next — 토큰 저장 → GET /users/me → next 로 이동. (DESIGN_GAPS A-6: 시안 없음) */
function CallbackClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [failed, setFailed] = useState(false);

  const accessToken = params.get("accessToken");
  const refreshToken = params.get("refreshToken");
  const next = params.get("next") || HOME_PATH;
  // 쿼리에 토큰이 없으면 렌더 시점에 바로 실패 상태로 보여준다 — effect 안에서 동기 setState를 하지 않기 위해.
  const missingTokens = !accessToken || !refreshToken;

  useEffect(() => {
    if (missingTokens || !accessToken || !refreshToken) return;

    useAuthStore.getState().setAccessToken(accessToken);
    writeRefreshToken(refreshToken);
    getMe()
      .then((profile) => {
        useAuthStore.getState().setSession(accessToken, profile);
        router.replace(next);
      })
      .catch(() => setFailed(true));
  }, [accessToken, refreshToken, next, missingTokens, router]);

  if (missingTokens || failed)
    return (
      <ScreenError
        message="로그인에 실패했어요. 다시 시도해 주세요."
        onRetry={() => router.replace("/login")}
      />
    );
  return <ScreenLoading />;
}

// useSearchParams()는 App Router에서 Suspense 경계가 필요하다(없으면 next build 실패).
export default function Page() {
  return (
    <Suspense fallback={<ScreenLoading />}>
      <CallbackClient />
    </Suspense>
  );
}
