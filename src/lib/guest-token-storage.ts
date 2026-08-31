/**
 * 게스트 토큰 보관 (회원가입 없이 참여하는 학생용). 탭을 닫으면 사라져야 하므로 sessionStorage.
 * SSR·테스트처럼 window가 없는 곳에서는 조용히 null을 돌려준다.
 */
const GUEST_TOKEN_KEY = "passmate.guestToken";

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

export function readGuestToken(): string | null {
  return storage()?.getItem(GUEST_TOKEN_KEY) ?? null;
}

export function writeGuestToken(token: string): void {
  storage()?.setItem(GUEST_TOKEN_KEY, token);
}

export function clearGuestToken(): void {
  storage()?.removeItem(GUEST_TOKEN_KEY);
}
