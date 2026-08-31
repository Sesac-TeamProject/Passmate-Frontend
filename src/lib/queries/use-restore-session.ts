import { useEffect } from "react";
import { getMe, refreshTokens } from "@/lib/api/auth";
import { IS_MOCK } from "@/lib/env";
import { MOCK_REFRESH_TOKEN } from "@/lib/mocks/auth";
import { useAuthStore, type AuthStatus } from "@/lib/stores/auth-store";
import { readRefreshToken, writeRefreshToken } from "@/lib/token-storage";

/**
 * 새로고침 시 세션 복원 (설계 문서 §6): localStorage의 refresh 토큰 → 재발급 → GET /me → auth-store.
 * 앱 수명 동안 한 번만 실행되며, 결과는 스토어 status로만 알린다.
 */
export function useRestoreSession(): AuthStatus {
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    const { beginRestore, setSession, clearSession } = useAuthStore.getState();

    if (!beginRestore()) return;

    restoreSession()
      .then((session) => {
        if (session) setSession(session.accessToken, session.profile);
        else clearSession();
      })
      .catch((cause: unknown) => {
        console.warn("세션 복원 실패", cause);
        clearSession();
      });
  }, []);

  return status;
}

async function restoreSession() {
  // 목 모드는 저장된 토큰이 없어도 운영자 계정으로 들어간다 (백엔드 없이 화면 확인용).
  const refreshToken = readRefreshToken() ?? (IS_MOCK ? MOCK_REFRESH_TOKEN : null);

  if (!refreshToken) return null;

  const tokens = await refreshTokens(refreshToken);

  useAuthStore.getState().setAccessToken(tokens.accessToken);
  if (tokens.refreshToken) writeRefreshToken(tokens.refreshToken);

  const profile = await getMe();

  return { accessToken: tokens.accessToken, profile };
}
