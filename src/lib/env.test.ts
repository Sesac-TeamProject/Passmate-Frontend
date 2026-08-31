import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deriveWsUrl } from "./env";

/**
 * WS 주소 유도 규칙과 빈 문자열 회귀. `.env.example`이 `NEXT_PUBLIC_WS_URL=`(빈 값)로 배포돼 있어
 * `??` 폴백이면 실서버 연동 중에도 WS_URL이 ""이 되고, stomp가 목 스트림으로 빠졌었다.
 */
describe("deriveWsUrl", () => {
  it("/api/v1을 떼고 /ws를 붙인다", () => {
    expect(deriveWsUrl("http://localhost:8080/api/v1")).toBe("ws://localhost:8080/ws");
    expect(deriveWsUrl("https://api.passmate.kr/api/v2")).toBe("wss://api.passmate.kr/ws");
  });

  it("버전 경로가 없으면 호스트 뒤에 붙인다", () => {
    expect(deriveWsUrl("http://localhost:8080")).toBe("ws://localhost:8080/ws");
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
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8080/api/v1");
    vi.stubEnv("NEXT_PUBLIC_WS_URL", "");

    const { WS_URL, IS_MOCK } = await import("./env");

    expect(IS_MOCK).toBe(false);
    expect(WS_URL).toBe("ws://localhost:8080/ws");
  });

  it("NEXT_PUBLIC_WS_URL이 채워져 있으면 그 값을 그대로 쓴다", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8080/api/v1");
    vi.stubEnv("NEXT_PUBLIC_WS_URL", "wss://ws.passmate.kr/ws");

    const { WS_URL } = await import("./env");

    expect(WS_URL).toBe("wss://ws.passmate.kr/ws");
  });
});
