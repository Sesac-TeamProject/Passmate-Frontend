import { describe, expect, it } from "vitest";
import { ERROR_CODES } from "./error-codes";

/**
 * 백엔드 `common/exception/ErrorCode.kt`(develop @ 9e39ce3)에서 그대로 옮긴 이름 53개.
 * 결제 7개(ENTRY_FEE_REQUIRED·PAYMENT_*·ALREADY_PAID·ALREADY_REFUNDED·REFUND_WINDOW_CLOSED·
 * NOT_PAID_ROOM)는 코인·참가비 PR #29~#32에서 늘었고, 별점 4개·게스트 기록 2개는
 * 그 기능이 실제로 구현되면서 늘었다.
 * 서버는 enum 이름을 code로 내보낸다 — 이 목록과 어긋나면 화면 분기가 조용히 죽는다.
 */
const SERVER_ENUM_NAMES = [
  "INVALID_INPUT",
  "UNSUPPORTED_PROVIDER",
  "UNSUPPORTED_ROOM_TYPE",
  "INVALID_QUESTION",
  "UNAUTHORIZED",
  "TOKEN_EXPIRED",
  "TOKEN_INVALID",
  "SOCIAL_TOKEN_INVALID",
  "INSUFFICIENT_COINS",
  "ENTRY_FEE_REQUIRED",
  "ACCESS_DENIED",
  "NOT_ROOM_HOST",
  "NOT_QUESTION_SET_OWNER",
  "HOST_LEVEL_REQUIRED",
  "ACCOUNT_SUSPENDED",
  "GUEST_NOT_ALLOWED",
  "NOT_FOUND",
  "USER_NOT_FOUND",
  "ROOM_NOT_FOUND",
  "QUESTION_SET_NOT_FOUND",
  "QUESTION_NOT_FOUND",
  "PARTICIPANT_NOT_FOUND",
  "CONFLICT",
  "ROOM_NOT_JOINABLE",
  "ROOM_FULL",
  "SESSION_NOT_RUNNING",
  "QUESTION_NOT_RUNNING",
  "ALREADY_SUBMITTED",
  "SCREEN_LOCKED",
  "SESSION_ALREADY_FINISHED",
  "QUESTION_SET_REQUIRED",
  "NICKNAME_DUPLICATED",
  "ALREADY_JOINED",
  "PAYMENT_NOT_COMPLETED",
  "PAYMENT_AMOUNT_MISMATCH",
  "ALREADY_PAID",
  "ALREADY_REFUNDED",
  "REFUND_WINDOW_CLOSED",
  "NOT_PAID_ROOM",
  "QUESTION_SET_ALREADY_CONFIRMED",
  "QUESTION_SET_EMPTY",
  "AI_FREE_LIMIT_EXCEEDED",
  "PIN_GENERATION_FAILED",
  "INTERNAL_ERROR",
  "AI_GENERATION_FAILED",
  "AI_ANALYSIS_FAILED",
  "EXTERNAL_API_ERROR",
  "RATING_NOT_ALLOWED",
  "SESSION_NOT_ENDED",
  "ALREADY_RATED",
  "RATING_WINDOW_CLOSED",
  "GUEST_RECORD_EXPIRED",
  "GUEST_RECORD_ALREADY_CLAIMED",
] as const;

/**
 * 서버 enum에 없는데 프런트가 들고 있는 코드. **비어 있어야 한다.**
 * 예전에 `RECORD_PURGED`를 여기 두었는데 서버의 실제 이름은 `GUEST_RECORD_EXPIRED`였다 —
 * 화면이 영영 타지 않는 분기를 들고 있었다.
 */
const UNVERIFIED: readonly string[] = [];

describe("ERROR_CODES", () => {
  it("모든 값이 키와 같다 (서버가 enum 이름을 그대로 내보낸다)", () => {
    for (const [key, value] of Object.entries(ERROR_CODES)) {
      expect(value).toBe(key);
    }
  });

  it("서버 enum에 없는 코드를 들고 있지 않다", () => {
    const allowed = new Set<string>([...SERVER_ENUM_NAMES, ...UNVERIFIED]);
    const unknown = Object.keys(ERROR_CODES).filter((k) => !allowed.has(k));
    expect(unknown).toEqual([]);
  });

  it("서버 enum 53개를 빠짐없이 들고 있다", () => {
    expect(SERVER_ENUM_NAMES).toHaveLength(53);
    const missing = SERVER_ENUM_NAMES.filter((name) => !(name in ERROR_CODES));
    expect(missing).toEqual([]);
    expect(Object.keys(ERROR_CODES)).toHaveLength(SERVER_ENUM_NAMES.length + UNVERIFIED.length);
  });

  it("화면이 실제로 분기하는 코드가 모두 있다", () => {
    for (const code of [
      "HOST_LEVEL_REQUIRED",
      "AI_GENERATION_FAILED",
      "INSUFFICIENT_COINS",
      "NICKNAME_DUPLICATED",
      "GUEST_NOT_ALLOWED",
      "AI_FREE_LIMIT_EXCEEDED",
      "SCREEN_LOCKED",
      "ALREADY_SUBMITTED",
      "SESSION_ALREADY_FINISHED",
      "QUESTION_SET_REQUIRED",
      "ENTRY_FEE_REQUIRED",
      "ALREADY_PAID",
      "PAYMENT_NOT_COMPLETED",
      "REFUND_WINDOW_CLOSED",
      "ALREADY_RATED",
      "RATING_WINDOW_CLOSED",
      "RATING_NOT_ALLOWED",
    ]) {
      expect(ERROR_CODES).toHaveProperty(code);
    }
  });
});
