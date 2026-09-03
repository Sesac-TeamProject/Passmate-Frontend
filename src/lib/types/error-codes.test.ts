import { describe, expect, it } from "vitest";
import { ERROR_CODES } from "./error-codes";

/**
 * 백엔드 `common/exception/ErrorCode.kt`(develop @ 5f433d2)에서 그대로 옮긴 이름 40개.
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
  "QUESTION_SET_ALREADY_CONFIRMED",
  "QUESTION_SET_EMPTY",
  "AI_FREE_LIMIT_EXCEEDED",
  "PIN_GENERATION_FAILED",
  "INTERNAL_ERROR",
  "AI_GENERATION_FAILED",
  "AI_ANALYSIS_FAILED",
  "EXTERNAL_API_ERROR",
] as const;

/** 서버 enum에 아직 없다 — 해당 기능(별점·게스트 기록 전환)이 미구현이라서. 구현되면 서버가 추가한다. */
const UNVERIFIED = ["ALREADY_RATED", "RECORD_PURGED"] as const;

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

  it("서버 enum 40개를 빠짐없이 들고 있다", () => {
    expect(SERVER_ENUM_NAMES).toHaveLength(40);
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
    ]) {
      expect(ERROR_CODES).toHaveProperty(code);
    }
  });
});
