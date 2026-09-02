/**
 * 서버 시각 문자열을 다루는 유일한 곳. `new Date(서버문자열)`을 직접 부르지 않는다.
 *
 * 백엔드는 Kotlin `LocalDateTime`을 그대로 직렬화해서 **시간대 표시가 없는** 문자열을 준다
 * (`"2026-09-02T02:12:49.123456"`). 서버 JVM은 UTC로 고정돼 있는데(`-Duser.timezone=UTC`),
 * 브라우저의 `new Date()`는 시간대 없는 문자열을 **로컬 시각**으로 읽는다 —
 * 한국에서 그대로 쓰면 9시간이 어긋난다. 그래서 여기서 `Z`를 붙여 UTC로 못박는다.
 *
 * 근거: `specs/001-passmate-mvp/research.md` R-5 · `contracts/rest-api.md` §0.
 * 백엔드가 `OffsetDateTime`으로 바꾸면(질문 B-3) 이 파일만 고치면 된다.
 */

/** 끝에 `Z` 또는 `+09:00`·`+0900` 같은 오프셋이 붙어 있는가 */
const HAS_ZONE = /(?:Z|[+-]\d{2}:?\d{2})$/i;

/**
 * 서버 시각 문자열 → `Date`.
 * - 오프셋이 없으면 UTC로 해석한다(`Z`를 붙인다) — 서버가 UTC로 돌기 때문이다.
 * - `Z`·오프셋이 이미 있으면 그대로 넘긴다(백엔드가 형식을 바꿔도 깨지지 않게).
 * - 파싱할 수 없으면 Invalid Date를 돌려준다. 호출부는 `Number.isNaN(d.getTime())`으로 거른다.
 */
export function parseServerDateTime(value: string): Date {
  const trimmed = value.trim();
  if (!trimmed) return new Date(Number.NaN);
  return new Date(HAS_ZONE.test(trimmed) ? trimmed : `${trimmed}Z`);
}

/**
 * `Date` → 서버가 받는 형식(UTC naive, 초 단위).
 * `scheduledAt`처럼 시각을 **보낼 때** 쓴다. 밀리초·`Z`를 빼는 이유는 서버가 `LocalDateTime`으로
 * 받기 때문이다 — `Z`가 붙으면 파싱에 걸린다.
 */
export function toServerDateTime(date: Date): string {
  return date.toISOString().slice(0, 19);
}

/**
 * 문항 마감(`endsAt`)까지 남은 밀리초. 지났으면 0.
 * 타이머는 이 값에서 파생시킨다 — 클라이언트가 따로 카운트다운을 소유하지 않는다(규칙 §9).
 */
export function remainingMs(endsAt: string, now: number = Date.now()): number {
  const ends = parseServerDateTime(endsAt).getTime();
  if (Number.isNaN(ends)) return 0;
  return Math.max(0, ends - now);
}
