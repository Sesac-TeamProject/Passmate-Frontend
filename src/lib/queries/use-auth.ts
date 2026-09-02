import { useMutation, useQueryClient } from "@tanstack/react-query";
import { devLogin, getMe, logout } from "@/lib/api/auth";
import { clearGuestToken } from "@/lib/guest-token-storage";
import { useAuthStore } from "@/lib/stores/auth-store";
import { clearRefreshToken, writeRefreshToken } from "@/lib/token-storage";

/**
 * POST /auth/logout — refresh 무효화. 실패해도 로컬 로그아웃은 진행한다.
 * 성공 여부와 무관하게 refresh·게스트 토큰을 지우고 auth-store를 비우고 모든 쿼리 캐시를 비운다.
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout().catch(() => undefined),
    onSettled: () => {
      clearRefreshToken();
      clearGuestToken();
      useAuthStore.getState().clearSession();
      queryClient.clear();
    },
  });
}

/**
 * POST /auth/dev-login — **개발 전용.** 백엔드 local·dev 프로파일에만 있고 운영에는 없다(404).
 * `GOOGLE_CLIENT_ID`를 받기 전까지 실서버 화면을 확인하는 유일한 로그인 경로다(`research.md` R-10).
 *
 * 성공 처리는 소셜 로그인과 **같은 경로**를 탄다: refresh 저장 → 액세스 토큰 → `GET /users/me`로 프로필.
 * 로그인 응답의 `user`(UserSummary)에는 지표·코인·가입일이 없어 프로필로 쓸 수 없다.
 */
export function useDevLogin() {
  return useMutation({
    mutationFn: async (input: { key: string; nickname?: string }) => {
      const res = await devLogin(input.key, input.nickname);
      writeRefreshToken(res.refreshToken);
      useAuthStore.getState().setAccessToken(res.accessToken);
      const profile = await getMe();
      useAuthStore.getState().setSession(res.accessToken, profile);
      return res;
    },
  });
}
