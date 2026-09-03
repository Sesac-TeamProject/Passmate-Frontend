import { create } from "zustand";
import type { AvatarKey, MyProfileResponse } from "@/lib/types/dto";
import { toAvatarKey } from "@/lib/types/dto";

/**
 * 인증 상태 (설계 문서 §4, §6). access 토큰은 메모리에만 둔다.
 * 새로고침 복원은 `queries/use-restore-session`이 하고, 여기는 상태와 액션만 가진다
 * (스토어 → api 방향 의존을 만들지 않기 위해).
 */
export type AuthStatus = "idle" | "restoring" | "authenticated" | "unauthenticated";

type AuthState = {
  status: AuthStatus;
  accessToken: string | null;
  profile: MyProfileResponse | null;
  /**
   * 쓰던 도중에 세션이 끊겼는가. 처음부터 미로그인인 것과 구분한다 —
   * 전자는 E-401 화면으로 알리고(하던 일이 있었으니), 후자는 곧장 로그인으로 보낸다.
   */
  expired: boolean;
  /** 복원 시작. 이미 시작했으면 false (StrictMode 이중 실행 방지) */
  beginRestore: () => boolean;
  setSession: (accessToken: string, profile: MyProfileResponse) => void;
  setAccessToken: (accessToken: string) => void;
  /** 프로필 일부만 갱신(예: 닉네임 수정 성공 시). 프로필이 없으면(비로그인) 아무 일도 하지 않는다 */
  setProfile: (patch: Partial<MyProfileResponse>) => void;
  clearSession: () => void;
  /** 살아 있던 세션이 만료돼 끊겼을 때. clearSession과 같지만 expired 표시가 남는다 */
  expireSession: () => void;
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  status: "idle",
  accessToken: null,
  profile: null,
  expired: false,

  beginRestore: () => {
    if (get().status !== "idle") return false;
    set({ status: "restoring" });
    return true;
  },

  setSession: (accessToken, profile) =>
    set({ status: "authenticated", accessToken, profile, expired: false }),

  setAccessToken: (accessToken) => set({ accessToken }),

  setProfile: (patch) =>
    set((s) => {
      if (!s.profile) return { profile: s.profile };
      // patch에 값이 있는 키만 덮어쓴다 — undefined를 명시적으로 넘겨도 기존 값을 지우지 않는다.
      const defined = Object.fromEntries(
        Object.entries(patch).filter(([, value]) => value !== undefined),
      ) as Partial<MyProfileResponse>;
      return { profile: { ...s.profile, ...defined } };
    }),

  clearSession: () =>
    set({ status: "unauthenticated", accessToken: null, profile: null, expired: false }),

  expireSession: () =>
    set({ status: "unauthenticated", accessToken: null, profile: null, expired: true }),
}));

/**
 * 파생 selector — 화면이 프로필 필드를 직접 파지 않게 한다.
 * 서버가 필드 이름을 바꾸면(예: `defaultAvatarId`) 고칠 곳이 여기 하나다.
 */

/** 관리자 여부. 서버는 역할 컬럼 없이 `isAdmin` boolean 하나만 준다 */
export const selectIsAdmin = (s: AuthState): boolean => s.profile?.isAdmin ?? false;

/** 내 회원 id. 랭킹·결과에서 "나"를 찾을 때 쓴다 */
export const selectUserId = (s: AuthState): number | null => s.profile?.id ?? null;

/** 기본 캐릭터 키. 서버가 12종 밖의 값(`"default"`)을 줄 수 있어 항상 접어서 돌려준다 */
export const selectAvatarKey = (s: AuthState): AvatarKey => toAvatarKey(s.profile?.defaultAvatarId);
