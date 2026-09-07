import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deriveWsUrl } from "./env";

/**
 * WS 주소 유도 규칙과 빈 문자열 회귀. `.env.example`이 `NEXT_PUBLIC_WS_URL=`(빈 값)로 배포돼 있어
 * `??` 폴백이면 실서버 연동 중에도 WS_URL이 ""이 되고, stomp가 목 스트림으로 빠졌었다.
 */
describe("deriveWsUrl", () => {
  it("prefix 없는 실제 base URL 뒤에 /ws를 붙인다", () => {
    expect(deriveWsUrl("http://localhost:8080")).toBe("ws://localhost:8080/ws");
    expect(deriveWsUrl("https://api.passmate.kr")).toBe("wss://api.passmate.kr/ws");
  });

  it("낡은 /api/v{n} 값이 남아 있으면 떼고 붙인다", () => {
    expect(deriveWsUrl("http://localhost:8080/api/v1")).toBe("ws://localhost:8080/ws");
    expect(deriveWsUrl("https://api.passmate.kr/api/v2")).toBe("wss://api.passmate.kr/ws");
  });

  it("끝 슬래시는 무시한다", () => {
    expect(deriveWsUrl("http://localhost:8080/api/v1/")).toBe("ws://localhost:8080/ws");
    expect(deriveWsUrl("http://localhost:8080/")).toBe("ws://localhost:8080/ws");
  });

  it("빈 입력은 빈 문자열", () => {
    expect(deriveWsUrl("")).toBe("");
  });
});

describe("WS_URL", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("NEXT_PUBLIC_WS_URL이 빈 문자열이면 API 주소에서 유도한다", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8080");
    vi.stubEnv("NEXT_PUBLIC_WS_URL", "");

    const { WS_URL, IS_MOCK } = await import("./env");

    expect(IS_MOCK).toBe(false);
    expect(WS_URL).toBe("ws://localhost:8080/ws");
  });

  it("NEXT_PUBLIC_WS_URL이 채워져 있으면 그 값을 그대로 쓴다", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8080");
    vi.stubEnv("NEXT_PUBLIC_WS_URL", "wss://ws.passmate.kr/ws");

    const { WS_URL } = await import("./env");

    expect(WS_URL).toBe("wss://ws.passmate.kr/ws");
  });
});

/**
 * 운영 로그인 화면에 개발용 입장 칸이 새면 안 된다 — 켜는 값은 `"1"` 하나뿐이고
 * 안 넘겼을 때(운영 기본값)와 CI가 main 에 넘기는 `"off"` 는 반드시 꺼져야 한다.
 */
describe("ENABLE_DEV_LOGIN", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('"1"일 때만 켜진다', async () => {
    vi.stubEnv("NEXT_PUBLIC_ENABLE_DEV_LOGIN", "1");

    const { ENABLE_DEV_LOGIN } = await import("./env");

    expect(ENABLE_DEV_LOGIN).toBe(true);
  });

  it.each(["", "off", "0", "true", "yes"])('"%s"는 꺼진 것으로 본다', async (value) => {
    vi.stubEnv("NEXT_PUBLIC_ENABLE_DEV_LOGIN", value);

    const { ENABLE_DEV_LOGIN } = await import("./env");

    expect(ENABLE_DEV_LOGIN).toBe(false);
  });

  it("값이 아예 없으면 꺼진다 — 운영이 기본값이다", async () => {
    vi.stubEnv("NEXT_PUBLIC_ENABLE_DEV_LOGIN", undefined);

    const { ENABLE_DEV_LOGIN } = await import("./env");

    expect(ENABLE_DEV_LOGIN).toBe(false);
  });
});
