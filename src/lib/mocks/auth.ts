import type { TokenRefreshResponse } from "@/lib/types/dto";

/** 목 모드(NEXT_PUBLIC_API_BASE_URL 미설정)에서 쓰는 토큰. 프로필은 mocks/me.ts mockMe()가 돌려준다. */
export const MOCK_REFRESH_TOKEN = "mock-refresh-token";

// POST /auth/refresh 응답 형태(TokenPair가 아니다 — 회전된 refreshToken은 선택 필드다)
export const MOCK_TOKENS: TokenRefreshResponse = {
  accessToken: "mock-access-token",
  refreshToken: MOCK_REFRESH_TOKEN,
};
