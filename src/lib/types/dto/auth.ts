import type { HostLevel } from "./common";

/** @draft — 계약(`GET /users/me`)에는 role이 없다. 관리자 가드용으로 서버에 추가 요청(DESIGN_GAPS D-9). */
export type UserRole = "TEACHER" | "STUDENT" | "ADMIN";

/** POST /auth/refresh 요청 */
export type TokenRefreshRequest = { refreshToken: string };
/** POST /auth/refresh 응답 — refreshToken은 미회전 시 생략 */
export type TokenRefreshResponse = { accessToken: string; refreshToken?: string | null };
/** 로그인 콜백 쿼리(`/auth/callback?accessToken&refreshToken`)로 받는 쌍 */
export type TokenPair = { accessToken: string; refreshToken: string };

/** GET /users/me — 계약 UserProfileResponse 1:1 */
export type UserProfileResponse = {
  nickname?: string;
  email?: string | null;
  joinedAt?: string | null;
  avatarId?: number | null;
  level?: HostLevel | null;
  coins?: number | null;
  joinedRoomCount?: number | null;
  hostedRoomCount?: number | null;
};

/** auth-store가 들고 있는 내 프로필. userId·name·role은 @draft — 계약(GET /users/me)에 없음(DESIGN_GAPS D-9). role은 관리자 가드·사이드바 호환을 위해 필수로 둔다. */
export type MeResponse = UserProfileResponse & { userId?: number; name?: string; role: UserRole };

/** PUT /users/me — 닉네임·기본 캐릭터 부분 수정 */
export type UpdateProfileRequest = { nickname?: string | null; avatarId?: number | null };
