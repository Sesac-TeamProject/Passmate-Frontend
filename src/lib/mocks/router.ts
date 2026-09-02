/**
 * 목 라우트 매칭기. `resolveMock`이 "METHOD /path" 표에서 요청과 일치하는 핸들러를 찾을 때 쓴다.
 */
export type MockContext = { params: Record<string, string>; url: URL; body?: unknown };
export type MockHandler = (ctx: MockContext) => unknown;
export type MockMatch = { key: string; params: Record<string, string> };

/**
 * "METHOD /a/:b/c" 표에서 일치하는 라우트를 찾는다. 세그먼트 수가 같고 `:name`은 아무 값.
 *
 * 여러 개가 맞으면 **고정 세그먼트가 많은 쪽(= 파라미터가 적은 쪽)** 을 고른다 —
 * `/rooms/public`과 `/rooms/:roomId`가 함께 있을 때 표 순서에 따라 승자가 바뀌면
 * 라우트를 추가하는 위치만으로 다른 화면이 조용히 깨진다.
 */
export function matchMockRoute(
  keys: readonly string[],
  method: string,
  pathname: string,
): MockMatch | null {
  const target = pathname.split("/").filter(Boolean);
  let best: (MockMatch & { paramCount: number }) | null = null;

  for (const key of keys) {
    const [keyMethod, keyPath] = key.split(" ");
    if (keyMethod !== method) continue;

    const pattern = (keyPath ?? "").split("/").filter(Boolean);
    if (pattern.length !== target.length) continue;

    const params: Record<string, string> = {};
    const matched = pattern.every((seg, i) => {
      if (seg.startsWith(":")) {
        params[seg.slice(1)] = decodeURIComponent(target[i]);
        return true;
      }
      return seg === target[i];
    });
    if (!matched) continue;

    const paramCount = Object.keys(params).length;
    if (paramCount === 0) return { key, params };
    if (!best || paramCount < best.paramCount) best = { key, params, paramCount };
  }

  return best ? { key: best.key, params: best.params } : null;
}
