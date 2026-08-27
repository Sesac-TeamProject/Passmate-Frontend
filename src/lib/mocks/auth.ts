import type { MeResponse, TokenPair } from "@/lib/types/dto";

/** 목 모드(NEXT_PUBLIC_API_BASE_URL 미설정)에서 쓰는 운영자 계정. */
export const MOCK_REFRESH_TOKEN = "mock-refresh-token";

export const MOCK_TOKENS: TokenPair = {
  accessToken: "mock-access-token",
  refreshToken: MOCK_REFRESH_TOKEN,
};

export const MOCK_ME: MeResponse = {
  id: 1,
  name: "이한결",
  email: "admin@passmate.kr",
  role: "ADMIN",
  hostLevel: null,
};
