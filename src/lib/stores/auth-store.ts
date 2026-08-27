import { create } from "zustand";
import type { MeResponse } from "@/lib/types/dto";

/**
 * 인증 상태 (설계 문서 §4, §6). access 토큰은 메모리에만 둔다.
 * 새로고침 복원은 `queries/use-restore-session`이 하고, 여기는 상태와 액션만 가진다
 * (스토어 → api 방향 의존을 만들지 않기 위해).
 */
export type AuthStatus = "idle" | "restoring" | "authenticated" | "unauthenticated";

type AuthState = {
  status: AuthStatus;
  accessToken: string | null;
  profile: MeResponse | null;
  /** 복원 시작. 이미 시작했으면 false (StrictMode 이중 실행 방지) */
  beginRestore: () => boolean;
  setSession: (accessToken: string, profile: MeResponse) => void;
  setAccessToken: (accessToken: string) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  status: "idle",
  accessToken: null,
  profile: null,

  beginRestore: () => {
    if (get().status !== "idle") return false;
    set({ status: "restoring" });
    return true;
  },

  setSession: (accessToken, profile) => set({ status: "authenticated", accessToken, profile }),

  setAccessToken: (accessToken) => set({ accessToken }),

  clearSession: () => set({ status: "unauthenticated", accessToken: null, profile: null }),
}));
