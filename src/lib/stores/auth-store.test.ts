import { beforeEach, describe, expect, it } from "vitest";
import type { MeResponse } from "@/lib/types/dto";
import { useAuthStore } from "./auth-store";

const PROFILE: MeResponse = { nickname: "한결", email: "test@example.com", isAdmin: false };

/**
 * `expired`는 "쓰던 도중에 끊긴 세션"과 "처음부터 미로그인"을 가른다.
 * 이 구분이 무너지면 RequireAuth가 E-401 화면 대신 말없이 로그인으로 튕기거나(전자),
 * 반대로 비로그인 방문자에게 "로그인이 만료됐어요"를 보여준다(후자). 둘 다 조용히 잘못된다.
 */
describe("stores/auth-store expired", () => {
  beforeEach(() => {
    useAuthStore.setState({
      status: "idle",
      accessToken: null,
      profile: null,
      expired: false,
    });
  });

  it("clearSession은 만료로 표시하지 않는다 — 미로그인은 곧장 로그인으로 보낸다", () => {
    useAuthStore.getState().setSession("token", PROFILE);
    useAuthStore.getState().clearSession();

    expect(useAuthStore.getState().status).toBe("unauthenticated");
    expect(useAuthStore.getState().expired).toBe(false);
  });

  it("expireSession은 만료로 표시한다 — E-401 화면을 띄우는 유일한 조건", () => {
    useAuthStore.getState().setSession("token", PROFILE);
    useAuthStore.getState().expireSession();

    expect(useAuthStore.getState().status).toBe("unauthenticated");
    expect(useAuthStore.getState().expired).toBe(true);
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().profile).toBeNull();
  });

  it("다시 로그인하면 만료 표시가 사라진다 — 남으면 로그인 직후 E-401이 다시 뜬다", () => {
    useAuthStore.getState().expireSession();
    useAuthStore.getState().setSession("token", PROFILE);

    expect(useAuthStore.getState().status).toBe("authenticated");
    expect(useAuthStore.getState().expired).toBe(false);
  });

  it("만료 뒤 clearSession하면 표시가 지워진다 — 로그아웃은 만료가 아니다", () => {
    useAuthStore.getState().expireSession();
    useAuthStore.getState().clearSession();

    expect(useAuthStore.getState().expired).toBe(false);
  });
});
