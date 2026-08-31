import type { MeResponse, TokenPair, TokenRefreshRequest } from "@/lib/types/dto";
import { request } from "./client";

/** POST /auth/refresh — refresh 토큰으로 토큰 쌍 재발급 */
export function refreshTokens(refreshToken: string): Promise<TokenPair> {
  const body: TokenRefreshRequest = { refreshToken };
  return request<TokenPair>("/auth/refresh", { method: "POST", body });
}

/** GET /me — 내 프로필·역할·등급 */
export function getMe(): Promise<MeResponse> {
  return request<MeResponse>("/me");
}
