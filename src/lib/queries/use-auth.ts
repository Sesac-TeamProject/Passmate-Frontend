import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "@/lib/api/auth";
import { clearGuestToken } from "@/lib/guest-token-storage";
import { useAuthStore } from "@/lib/stores/auth-store";
import { clearRefreshToken } from "@/lib/token-storage";

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
