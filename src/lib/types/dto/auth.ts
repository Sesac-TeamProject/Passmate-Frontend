import type { AuthProvider } from "./common";

/** @draft 관리자 콘솔의 사용자 목록이 보여주는 역할 라벨. 내 프로필에는 역할이 없다(isAdmin만 있다) */
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

/** POST /auth/dev-login 요청 — 백엔드 local·dev 프로파일 전용. 같은 key면 같은 계정 */
export type DevLoginRequest = { key: string; nickname?: string; email?: string };

/** 백엔드 `auth/dto/UserSummary.kt` 1:1 — 로그인 응답에만 들어간다(내 프로필은 MyProfileResponse) */
export type UserSummary = {
  id: number;
  nickname: string;
  email?: string;
  profileImageUrl?: string;
  /** 기본 캐릭터 키. 서버는 문자열 그대로 준다 — 화면에 쓸 때 `toAvatarKey()`로 접는다 */
  defaultAvatarId?: string;
  isAdmin: boolean;
};

/** POST /auth/login/{provider} · POST /auth/dev-login 응답 — 백엔드 LoginResponse.kt 1:1 */
export type LoginResponse = {
  /** true면 온보딩을 띄운다 */
  isNewUser: boolean;
  accessToken: string;
  refreshToken: string;
  /** 액세스 토큰 만료까지 남은 초 (3600) */
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

/** 마이페이지 요약 지표 — 백엔드 `user/dto/UserResponses.kt` MyStatsResponse 1:1 */
export type MyStatsResponse = {
  joinedRoomCount: number;
  hostedRoomCount: number;
  /** 시작해서 종료까지 간 방만 센다 */
  hostedSessionCount: number;
  /** 종료된 내 방들의 참가자 합 */
  totalStudentCount: number;
};

/**
 * GET /users/me · PUT /users/me 응답 — 백엔드 `MyProfileResponse` 1:1.
 *
 * 회원 유형은 하나다(방을 열면 호스트, 들어가면 참가자) — 학생 지표와 호스트 지표가 한 응답에 같이 온다.
 * **등급·뱃지·평균 별점은 일부러 없다.** 서버가 "0·null로 미리 내보내면 '등급 없음'으로 읽혀
 * 오해를 만든다"고 비워 둔 자리다 — 화면도 값을 지어내지 말고 "준비 중"으로 둔다.
 */
export type MyProfileResponse = {
  id: number;
  nickname: string;
  email?: string;
  provider: AuthProvider;
  profileImageUrl?: string;
  /** 방 입장 시 참가자 아바타의 기본값. 12종 밖의 값(`"default"`)이 올 수 있다 */
  defaultAvatarId?: string;
  isAdmin: boolean;
  /** 가입일 (UTC naive — `parseServerDateTime`으로 읽는다) */
  joinedAt: string;
  lastLoginAt?: string;
  stats: MyStatsResponse;
  /** 보유 코인 (1 C = 1원) */
  coinBalance: number;
};

/** auth-store가 들고 있는 내 프로필. `GET /users/me` 응답 그대로다 */
export type MeResponse = MyProfileResponse;

/** PUT /users/me 요청 — 백엔드 `UserProfileUpdateRequest` 1:1. nickname은 필수(≤30자) */
export type UserProfileUpdateRequest = {
  nickname: string;
  /** 비우면 지운다(≤500자) */
  profileImageUrl?: string;
  /** 기본 캐릭터(≤30자) */
  defaultAvatarId?: string;
};
