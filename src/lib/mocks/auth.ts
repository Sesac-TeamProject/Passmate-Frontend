import type { LoginResponse, TokenRefreshResponse } from "@/lib/types/dto";
import { ME_PROFILE, ME_USER_ID } from "./fixtures";

/** 목 모드(NEXT_PUBLIC_API_BASE_URL 미설정)에서 쓰는 토큰. 프로필은 mocks/me.ts mockMe()가 돌려준다. */
export const MOCK_REFRESH_TOKEN = "mock-refresh-token";

/** POST /auth/refresh 응답 — 백엔드 TokenResponse.kt 1:1 */
export const MOCK_TOKENS: TokenRefreshResponse = {
  accessToken: "mock-access-token",
  refreshToken: MOCK_REFRESH_TOKEN,
  expiresIn: 3600,
};

/**
 * POST /auth/login/{provider} · POST /auth/dev-login 응답 — 백엔드 LoginResponse.kt 1:1.
 * 목은 늘 같은 계정(이한결)을 돌려준다 — 백엔드 dev-login이 같은 key에 같은 계정을 주는 것과 같은 성질.
 */
export function mockLogin(): LoginResponse {
  return {
    isNewUser: false,
    accessToken: MOCK_TOKENS.accessToken,
    refreshToken: MOCK_TOKENS.refreshToken,
    expiresIn: MOCK_TOKENS.expiresIn,
    user: {
      id: ME_USER_ID,
      nickname: ME_PROFILE.nickname ?? "한결",
      email: ME_PROFILE.email ?? null,
      profileImageUrl: null,
      defaultAvatarId: "fox",
      isAdmin: true,
    },
  };
}
