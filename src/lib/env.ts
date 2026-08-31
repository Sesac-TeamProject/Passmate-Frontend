/**
 * 빌드 시점에 인라인되는 공개 환경값.
 * NEXT_PUBLIC_API_BASE_URL이 비어 있으면 백엔드 없이 목 응답으로 동작한다 (lib/mocks).
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export const IS_MOCK = API_BASE_URL === "";

/**
 * STOMP 엔드포인트. 비우면 API base에서 유도한다 (http://h:8080/api/v1 → ws://h:8080/ws).
 * `??`가 아니라 `||`인 이유: .env.example이 `NEXT_PUBLIC_WS_URL=`(빈 문자열)로 배포돼 있어
 * `??`면 빈 문자열이 그대로 남고, 실서버 연동 중에도 WS_URL이 ""이 된다.
 */
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || deriveWsUrl(API_BASE_URL);

/** http(s)://host[/api/v{n}] → ws(s)://host/ws. 빈 입력은 빈 문자열. */
export function deriveWsUrl(apiBase: string): string {
  if (!apiBase) return "";
  return (
    apiBase
      .replace(/^http/, "ws")
      .replace(/\/api\/v\d+\/?$/, "")
      .replace(/\/$/, "") + "/ws"
  );
}
