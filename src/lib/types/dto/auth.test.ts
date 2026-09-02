import { describe, expect, it } from "vitest";
import { MOCK_TOKENS, mockLogin } from "@/lib/mocks/auth";
import { mockMe } from "@/lib/mocks/me";

/**
 * 백엔드 `auth/dto/*.kt`·`user/dto/UserResponses.kt` (develop @ 5f433d2) 필드와 1:1인지
 * 목이 돌려주는 값으로 고정한다. 타입만 검사하면(expectTypeOf) 런타임에는 no-op이라
 * 목이 어긋나도 초록으로 지나간다 — 실제 값의 키를 비교해야 계약이 흔들릴 때 잡힌다.
 *
 * 서버는 `non_null` 직렬화라 **값이 없는 필드는 응답에서 빠진다.** 그래서 "정확히 같은 키"가 아니라
 * "필수 키는 모두 있고, 서버에 없는 키는 하나도 없다"로 본다.
 */
function expectContract(value: object, required: string[], optional: string[] = []) {
  const keys = Object.keys(value);
  expect(required.filter((k) => !keys.includes(k))).toEqual([]);
  expect(keys.filter((k) => !required.includes(k) && !optional.includes(k))).toEqual([]);
}

describe("auth 계약", () => {
  it("LoginResponse는 백엔드 LoginResponse.kt와 같은 필드를 갖는다", () => {
    expectContract(mockLogin(), ["accessToken", "expiresIn", "isNewUser", "refreshToken", "user"]);
  });

  it("UserSummary는 백엔드 UserSummary.kt와 같은 필드를 갖는다", () => {
    expectContract(
      mockLogin().user,
      ["id", "nickname", "isAdmin"],
      ["email", "profileImageUrl", "defaultAvatarId"],
    );
  });

  it("refresh 응답에 expiresIn이 있다 (백엔드 TokenResponse.kt)", () => {
    expect(MOCK_TOKENS).toHaveProperty("expiresIn");
    expect(typeof MOCK_TOKENS.expiresIn).toBe("number");
  });

  it("MyProfileResponse는 백엔드 UserResponses.kt와 같은 필드를 갖는다", () => {
    expectContract(
      mockMe(),
      ["id", "nickname", "provider", "isAdmin", "joinedAt", "stats", "coinBalance"],
      ["email", "profileImageUrl", "defaultAvatarId", "lastLoginAt"],
    );
  });

  it("MyStatsResponse는 백엔드 MyStatsResponse.kt와 같은 필드를 갖는다", () => {
    expectContract(mockMe().stats, [
      "joinedRoomCount",
      "hostedRoomCount",
      "hostedSessionCount",
      "totalStudentCount",
    ]);
  });

  it("내 프로필에 등급·뱃지·별점 자리를 만들지 않는다", () => {
    // 서버가 일부러 비워 둔 값이다 — 0·null로 채우면 "등급 없음"이 "Lv.0"으로 읽힌다
    const me = mockMe();
    for (const absent of ["level", "badges", "averageStars", "ratingCount"]) {
      expect(me).not.toHaveProperty(absent);
    }
  });

  it("내 프로필은 role이 아니라 isAdmin으로 관리자를 가린다", () => {
    // ERD user 테이블 주석 "역할 컬럼 없음" — 서버는 is_admin boolean 하나만 준다
    const me = mockMe();
    expect(me).toHaveProperty("isAdmin");
    expect(me).not.toHaveProperty("role");
  });

  it("시각은 오프셋 없는 UTC naive 문자열이다 (parseServerDateTime이 읽는 형식)", () => {
    expect(mockMe().joinedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(mockMe().joinedAt).not.toMatch(/(Z|[+-]\d{2}:\d{2})$/);
  });
});
