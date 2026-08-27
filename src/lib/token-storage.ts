/**
 * refresh 토큰 보관 (설계 문서 ADR-3: access=메모리, refresh=localStorage).
 * SSR·테스트처럼 window가 없는 곳에서는 조용히 null을 돌려준다.
 */
const REFRESH_TOKEN_KEY = "passmate.refreshToken";

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function readRefreshToken(): string | null {
  return storage()?.getItem(REFRESH_TOKEN_KEY) ?? null;
}

export function writeRefreshToken(token: string): void {
  storage()?.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearRefreshToken(): void {
  storage()?.removeItem(REFRESH_TOKEN_KEY);
}
