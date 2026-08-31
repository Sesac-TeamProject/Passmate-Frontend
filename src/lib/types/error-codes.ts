/**
 * 서버 오류 응답 `code`. 화면은 HTTP 숫자가 아니라 이 값으로 문구를 분기한다.
 * 표시가 없는 5개는 KMP 클라이언트에서 실제로 관측된 값이고, `@draft` 3개는 계약 문서·설계에서만 나온
 * 값이라 서버가 정말 이 문자열을 쓰는지 확인되지 않았다 — 응답이 오면 이름을 맞춰야 할 수 있다.
 */
export const ERROR_CODES = {
  LOGIN_REQUIRED: "LOGIN_REQUIRED",
  /** @draft — KMP 미관측 */
  PAYMENT_REQUIRED: "PAYMENT_REQUIRED",
  HOST_LEVEL_REQUIRED: "HOST_LEVEL_REQUIRED",
  /** @draft — KMP 미관측 */
  FREE_QUOTA_EXCEEDED: "FREE_QUOTA_EXCEEDED",
  /** @draft — KMP 미관측 */
  AI_GENERATION_FAILED: "AI_GENERATION_FAILED",
  NICKNAME_TAKEN: "NICKNAME_TAKEN",
  ALREADY_RATED: "ALREADY_RATED",
  RECORD_PURGED: "RECORD_PURGED",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
