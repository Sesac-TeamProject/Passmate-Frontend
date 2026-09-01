import { describe, expect, it } from "vitest";
import { MOCK_TOKENS, mockLogin } from "@/lib/mocks/auth";
import { mockMe } from "@/lib/mocks/me";

/**
 * 백엔드 `auth/dto/*.kt` (develop @ f719493) 필드와 1:1인지 목이 돌려주는 값으로 고정한다.
 * 타입만 검사하면(expectTypeOf) 런타임에는 no-op이라 목이 어긋나도 초록으로 지나간다 —
 * 실제 값의 키를 비교해야 계약이 흔들릴 때 잡힌다.
 */
describe("auth 계약", () => {
  it("LoginResponse는 백엔드 LoginResponse.kt와 같은 필드를 갖는다", () => {
    expect(Object.keys(mockLogin()).sort()).toEqual([
      "accessToken",
      "expiresIn",
      "isNewUser",
      "refreshToken",
      "user",
    ]);
  });

  it("UserSummary는 백엔드 UserSummary.kt와 같은 필드를 갖는다", () => {
    expect(Object.keys(mockLogin().user).sort()).toEqual([
      "defaultAvatarId",
      "email",
      "id",
      "isAdmin",
      "nickname",
      "profileImageUrl",
    ]);
  });

  it("refresh 응답에 expiresIn이 있다 (백엔드 TokenResponse.kt)", () => {
    expect(MOCK_TOKENS).toHaveProperty("expiresIn");
    expect(typeof MOCK_TOKENS.expiresIn).toBe("number");
  });

  it("내 프로필은 role이 아니라 isAdmin으로 관리자를 가린다", () => {
    // ERD user 테이블 주석 "역할 컬럼 없음" — 서버는 is_admin boolean 하나만 준다
    const me = mockMe();
    expect(me).toHaveProperty("isAdmin");
    expect(me).not.toHaveProperty("role");
  });
});
