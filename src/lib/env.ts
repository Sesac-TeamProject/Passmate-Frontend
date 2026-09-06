/**
 * 빌드 시점에 인라인되는 공개 환경값.
 * NEXT_PUBLIC_API_BASE_URL이 비어 있으면 백엔드 없이 목 응답으로 동작한다 (lib/mocks).
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export const IS_MOCK = API_BASE_URL === "";

/**
 * 개발용 로그인(`POST /auth/dev-login`) 패널을 로그인 화면에 그릴지.
 * **정확히 `"1"` 일 때만 켠다** — 안 넣으면 꺼진다(운영이 기본값).
 *
 * 운영(passmate.kr)에는 이 패널이 있으면 안 된다. 백엔드 운영 프로파일에 API가 없어
 * 눌러도 404지만, 로그인 화면에 개발용 입력칸이 보이는 것 자체가 새는 것이다.
 *
 * **이 플래그는 main 에만 있다.** develop 에는 이 코드가 없어서 패널이 늘 그려진다 —
 * 테스트는 develop 에서 한다. 그래서 develop 을 main 에 머지할 때 이 파일이 되살아나지
 * 않는지(= 로그인 화면에 칸이 돌아오지 않는지) 릴리스마다 확인해야 한다.
 */
export const ENABLE_DEV_LOGIN = process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === "1";

/**
 * STOMP 엔드포인트. 비우면 API base에서 유도한다 (http://h:8080 → ws://h:8080/ws).
 * `??`가 아니라 `||`인 이유: .env.example이 `NEXT_PUBLIC_WS_URL=`(빈 문자열)로 배포돼 있어
 * `??`면 빈 문자열이 그대로 남고, 실서버 연동 중에도 WS_URL이 ""이 된다.
 */
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || deriveWsUrl(API_BASE_URL);

/**
 * http(s)://host → ws(s)://host/ws. 빈 입력은 빈 문자열.
 * 백엔드는 URL prefix가 없다(contracts/rest-api.md §0). 낡은 `/api/v{n}` 값이 남아 있어도
 * 떼어 내고 유도하도록 남겨 둔다.
 */
export function deriveWsUrl(apiBase: string): string {
  if (!apiBase) return "";
  return (
    apiBase
      .replace(/^http/, "ws")
      .replace(/\/api\/v\d+\/?$/, "")
      .replace(/\/$/, "") + "/ws"
  );
}
