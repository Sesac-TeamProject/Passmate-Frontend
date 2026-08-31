import { API_BASE_URL } from "@/lib/env";
import type { MeResponse, TokenRefreshRequest, TokenRefreshResponse } from "@/lib/types/dto";
import { request } from "./client";

/** POST /auth/refresh — refresh 토큰으로 토큰 쌍 재발급. refreshToken은 미회전 시 생략될 수 있다. */
export function refreshTokens(refreshToken: string): Promise<TokenRefreshResponse> {
  const body: TokenRefreshRequest = { refreshToken };
  return request<TokenRefreshResponse>("/auth/refresh", { method: "POST", body });
}

/** GET /users/me — 내 프로필(userId·role은 @draft) */
export function getMe(): Promise<MeResponse> {
  return request<MeResponse>("/users/me");
}

/** POST /auth/logout — refresh 무효화. 실패해도 로컬 로그아웃은 진행한다 */
export function logout(): Promise<void> {
  return request<void>("/auth/logout", { method: "POST" });
}

/** @draft — 계약은 client=mobile 뿐. 웹은 client=web + /auth/callback 리다이렉트를 요청(DESIGN_GAPS D-1) */
export function googleLoginUrl(next: string): string {
  const callback = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  return `${API_BASE_URL}/auth/oauth/google?client=web&redirect=${encodeURIComponent(callback)}`;
}
