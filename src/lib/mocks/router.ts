/**
 * 목 라우트 매칭기. `resolveMock`이 "METHOD /path" 표에서 요청과 일치하는 핸들러를 찾을 때 쓴다.
 */
export type MockContext = { params: Record<string, string>; url: URL; body?: unknown };
export type MockHandler = (ctx: MockContext) => unknown;
export type MockMatch = { key: string; params: Record<string, string> };

/** "METHOD /a/:b/c" 표에서 첫 일치를 찾는다. 세그먼트 수가 같고 `:name`은 아무 값. */
export function matchMockRoute(
  keys: readonly string[],
  method: string,
  pathname: string,
): MockMatch | null {
  const target = pathname.split("/").filter(Boolean);

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
    if (matched) return { key, params };
  }
  return null;
}
