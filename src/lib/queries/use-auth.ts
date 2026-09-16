import { useMutation, useQueryClient } from "@tanstack/react-query";
import { devLogin, getMe, logout } from "@/lib/api/auth";
import { clearGuestToken } from "@/lib/guest-token-storage";
import { useAuthStore } from "@/lib/stores/auth-store";
import { clearRefreshToken, writeRefreshToken } from "@/lib/token-storage";

/** 로그아웃 뒤 도착지 — 서비스 첫 화면인 랜딩(L-01). 배포된 주소가 그대로 랜딩이라 경로만 쓴다 */
const LANDING_PATH = "/";

/**
 * POST /auth/logout — refresh 무효화. 실패해도 로컬 로그아웃은 진행한다.
 * 성공 여부와 무관하게 refresh·게스트 토큰을 지우고 auth-store를 비우고 모든 쿼리 캐시를 비운 뒤 랜딩으로 나간다.
 *
 * 도착지를 화면이 아니라 여기서 정하는 이유 — 회원 화면은 `RequireAuth` 안에 있어서 세션이 비는 순간
 * 가드가 "미로그인 방문자"로 보고 `/login`으로 보낸다. 화면이 `router.replace("/")`를 불러도
 * 가드 쪽이 나중에 덮어써 로그인 창에 도착한다(재현 2026-09-16).
 * 문서 이동은 가드가 끼어들 틈이 없고, 남은 소켓·타이머·캐시도 함께 정리된다.
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
      if (typeof window !== "undefined") window.location.replace(LANDING_PATH);
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
