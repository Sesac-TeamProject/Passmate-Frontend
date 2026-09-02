import type {
  DevLoginRequest,
  LoginResponse,
  MyProfileResponse,
  SocialLoginRequest,
  TokenRefreshRequest,
  TokenRefreshResponse,
} from "@/lib/types/dto";
import { request } from "./client";

/** POST /auth/refresh — refresh 토큰으로 토큰 쌍 재발급 */
export function refreshTokens(refreshToken: string): Promise<TokenRefreshResponse> {
  const body: TokenRefreshRequest = { refreshToken };
  return request<TokenRefreshResponse>("/auth/refresh", { method: "POST", body });
}

/**
 * POST /auth/login/{provider} — Google 로그인(회원가입 겸용). 미가입이면 자동 가입한다.
 * 웹은 GIS로 받은 idToken, 또는 리다이렉트 플로우의 authorizationCode 중 하나만 보낸다.
 * provider 허용값은 "google"뿐이다.
 */
export function socialLogin(provider: "google", body: SocialLoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>(`/auth/login/${provider}`, { method: "POST", body });
}

/**
 * POST /auth/dev-login — **개발 전용.** 백엔드 local·dev 프로파일에만 등록된다.
 * 같은 key면 같은 계정이 나와 고정 계정으로 붙어볼 수 있다. 운영 프로파일에는 이 API가 없다.
 */
export function devLogin(key: string, nickname?: string, email?: string): Promise<LoginResponse> {
  const body: DevLoginRequest = { key, nickname, email };
  return request<LoginResponse>("/auth/dev-login", { method: "POST", body });
}

/** GET /users/me — 내 프로필(지표·코인 포함). 게스트 토큰으로 부르면 403 GUEST_NOT_ALLOWED */
export function getMe(): Promise<MyProfileResponse> {
  return request<MyProfileResponse>("/users/me");
}

/** POST /auth/logout — 클라이언트가 토큰을 폐기하는 것이 로그아웃 (서버는 stateless) */
export function logout(): Promise<void> {
  return request<void>("/auth/logout", { method: "POST" });
}
