import type { HostLevel } from "./common";

/** 관리자 콘솔의 사용자 목록이 보여주는 역할 라벨. 내 프로필에는 역할이 없다(isAdmin만 있다) */
export type UserRole = "TEACHER" | "STUDENT" | "ADMIN";

/** POST /auth/login/{provider} 요청 — idToken 또는 authorizationCode 중 하나만 보낸다 */
export type SocialLoginRequest = {
  /** Google ID 토큰 (웹 GIS · 모바일 SDK) */
  idToken?: string;
  /** Google 인가 코드 (웹 리다이렉트 플로우) */
  authorizationCode?: string;
  /** 인가 코드를 발급받을 때 쓴 redirect_uri. 생략하면 서버 설정값 */
  redirectUri?: string;
};

/** 백엔드 UserSummary.kt 1:1 */
export type UserSummary = {
  id: number;
  nickname: string;
  email: string | null;
  profileImageUrl: string | null;
  /** 기본 캐릭터 키. ERD user.default_avatar_id varchar(30) */
  defaultAvatarId: string | null;
  isAdmin: boolean;
};

/** POST /auth/login/{provider} · POST /auth/dev-login 응답 — 백엔드 LoginResponse.kt 1:1 */
export type LoginResponse = {
  /** true면 온보딩을 띄운다 */
  isNewUser: boolean;
  accessToken: string;
  refreshToken: string;
  /** 액세스 토큰 만료까지 남은 초 */
  expiresIn: number;
  user: UserSummary;
};

/** POST /auth/refresh 요청 */
export type TokenRefreshRequest = { refreshToken: string };
/** POST /auth/refresh 응답 — 백엔드 TokenResponse.kt 1:1 */
export type TokenRefreshResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};
/** 로그인 뒤 화면이 넘겨받는 토큰 쌍 */
export type TokenPair = { accessToken: string; refreshToken: string };

/** GET /users/me — 계약 UserProfileResponse. 명세 우선순위 1이지만 백엔드는 아직 미구현 */
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

/**
 * auth-store가 들고 있는 내 프로필.
 * 역할 컬럼은 없다 — ERD `user` 주석 "역할 컬럼 없음", 백엔드는 is_admin boolean 하나만 준다.
 */
export type MeResponse = UserProfileResponse & {
  userId?: number;
  name?: string;
  isAdmin: boolean;
};

/** PUT /users/me — 닉네임·기본 캐릭터 부분 수정 */
export type UpdateProfileRequest = { nickname?: string | null; avatarId?: number | null };
