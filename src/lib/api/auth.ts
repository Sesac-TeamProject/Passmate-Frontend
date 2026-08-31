import type { MeResponse, TokenRefreshRequest, TokenRefreshResponse } from "@/lib/types/dto";
import { request } from "./client";

/** POST /auth/refresh — refresh 토큰으로 토큰 쌍 재발급. refreshToken은 미회전 시 생략될 수 있다. */
export function refreshTokens(refreshToken: string): Promise<TokenRefreshResponse> {
  const body: TokenRefreshRequest = { refreshToken };
  return request<TokenRefreshResponse>("/auth/refresh", { method: "POST", body });
}

/** GET /me — 내 프로필·역할·등급 */
export function getMe(): Promise<MeResponse> {
  return request<MeResponse>("/me");
}
