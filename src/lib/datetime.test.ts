import { describe, expect, it } from "vitest";
import { parseServerDateTime, remainingMs, toServerDateTime } from "./datetime";

/**
 * 서버는 시간대 표시 없는 UTC 문자열을 준다(`research.md` R-5).
 * 이 테스트가 깨지면 화면의 모든 시각이 9시간 어긋난다 — 실행 머신 시간대와 무관하게 통과해야 한다.
 */
describe("parseServerDateTime", () => {
  it("오프셋이 없으면 UTC로 읽는다 (서버 LocalDateTime 형식)", () => {
    // 백엔드 GET /users/me 의 lastLoginAt 실제 형식 — 마이크로초 6자리
    expect(parseServerDateTime("2026-09-02T02:12:49.123456").toISOString()).toBe(
      "2026-09-02T02:12:49.123Z",
    );
  });

  it("소수초가 없어도 UTC로 읽는다", () => {
    expect(parseServerDateTime("2026-09-02T02:12:49").getTime()).toBe(
      Date.UTC(2026, 8, 2, 2, 12, 49),
    );
  });

  it("Z가 이미 있으면 그대로 읽는다", () => {
    expect(parseServerDateTime("2026-09-02T02:12:49Z").getTime()).toBe(
      Date.UTC(2026, 8, 2, 2, 12, 49),
    );
  });

  it("오프셋이 붙어 있으면 그 오프셋으로 읽는다 (백엔드가 OffsetDateTime으로 바뀔 때 대비)", () => {
    expect(parseServerDateTime("2026-09-02T11:12:49+09:00").getTime()).toBe(
      Date.UTC(2026, 8, 2, 2, 12, 49),
    );
  });

  it("빈 값·쓰레기 값은 Invalid Date", () => {
    expect(Number.isNaN(parseServerDateTime("").getTime())).toBe(true);
    expect(Number.isNaN(parseServerDateTime("어제").getTime())).toBe(true);
  });
});

describe("toServerDateTime", () => {
  it("UTC naive 초 단위로 직렬화한다 (Z·밀리초 없음)", () => {
    expect(toServerDateTime(new Date(Date.UTC(2026, 8, 2, 2, 12, 49, 500)))).toBe(
      "2026-09-02T02:12:49",
    );
  });

  it("보낸 값을 다시 읽으면 초까지 같다 (왕복)", () => {
    const source = new Date(Date.UTC(2026, 8, 2, 23, 59, 59));
    expect(parseServerDateTime(toServerDateTime(source)).getTime()).toBe(source.getTime());
  });
});

describe("remainingMs", () => {
  const now = Date.UTC(2026, 8, 2, 2, 12, 49);

  it("마감까지 남은 밀리초를 준다", () => {
    expect(remainingMs("2026-09-02T02:13:19", now)).toBe(30_000);
  });

  it("이미 지났으면 0 (음수로 내려가지 않는다)", () => {
    expect(remainingMs("2026-09-02T02:12:19", now)).toBe(0);
  });

  it("읽을 수 없는 값은 0", () => {
    expect(remainingMs("", now)).toBe(0);
  });
});
