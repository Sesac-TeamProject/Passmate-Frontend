const HOME_PATH = "/home";

/** 로그인 후 이동할 경로. 같은 출처의 절대 경로("/…")만 허용하고 "//evil", "https://…"는 홈으로 되돌린다 (오픈 리다이렉트 방지). */
export function safeNextPath(
  value: string | null | undefined,
  fallback: string = HOME_PATH,
): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
