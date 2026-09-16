/**
 * 현재 pathname에 해당하는 내비 항목의 path. 정확히 일치하는 항목이 없으면 하위 경로(prefix)로 가장 긴 항목을 고른다
 * — /me/account 는 "마이페이지"(/me), /me/joined 는 자기 항목이 활성. 동적 세그먼트([code] 등)는 아무 값이나 허용.
 *
 * 사이드바(PC)와 하단 탭바(폰)가 같은 규칙을 써야 해서 부품 밖 순수 함수로 둔다.
 */
export function findActivePath(
  pathname: string,
  patterns: readonly string[],
): string | undefined {
  const toRegExp = (pattern: string, tail: string) =>
    new RegExp("^" + pattern.replace(/\[[^\]]+\]/g, "[^/]+") + tail);
  const exact = patterns.find((p) => toRegExp(p, "$").test(pathname));
  if (exact) return exact;
  return patterns
    .filter((p) => toRegExp(p, "/").test(pathname))
    .sort((a, b) => b.length - a.length)[0];
}

/**
 * findActivePath가 못 찾았을 때 쓸 대체 경로(RouteMeta.nav 등)를 고른다. 후보 목록(allowed)에
 * 없으면 버린다 — 하단 탭바처럼 활성 표시가 정해진 몇 개뿐인 곳에서 엉뚱한 경로가 활성으로
 * 잡히지 않게 한다(예: 사이드바엔 있어도 탭바 4개에는 없는 nav).
 */
export function pickFallbackPath(
  fallback: string | undefined,
  allowed: readonly string[],
): string | undefined {
  return fallback !== undefined && allowed.includes(fallback) ? fallback : undefined;
}
