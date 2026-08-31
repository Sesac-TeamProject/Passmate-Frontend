import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * api 클라이언트 규칙 검증 (규칙 문서 §12): 401 → refresh 1회 → 재시도, `{code,message}` → AppError.
 * NEXT_PUBLIC_API_BASE_URL을 채워 목 모드를 끄고 fetch를 대체한다.
 */
const BASE_URL = "http://api.test";
const REFRESH_KEY = "passmate.refreshToken";

type FetchMock = ReturnType<typeof vi.fn>;

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function stubLocalStorage(initial: Record<string, string>) {
  const store = new Map(Object.entries(initial));
  const session = new Map<string, string>();

  vi.stubGlobal("window", {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    },
    sessionStorage: {
      getItem: (k: string) => session.get(k) ?? null,
      setItem: (k: string, v: string) => void session.set(k, v),
      removeItem: (k: string) => void session.delete(k),
    },
    location: { pathname: "/admin/users", search: "", assign: vi.fn() },
  });

  return store;
}

async function loadClient() {
  const [{ request }, { useAuthStore }, { AppError }] = await Promise.all([
    import("./client"),
    import("@/lib/stores/auth-store"),
    import("@/lib/types/app-error"),
  ]);
  return { request, useAuthStore, AppError };
}

describe("api/client", () => {
  let fetchMock: FetchMock;

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", BASE_URL);
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("오류 응답 {code,message}를 AppError로 바꾸고 code를 보존한다", async () => {
    stubLocalStorage({});
    fetchMock.mockResolvedValueOnce(
      jsonResponse(403, { code: "HOST_LEVEL_REQUIRED", message: "등급 부족" }),
    );
    const { request, AppError } = await loadClient();

    const error = await request("/rooms", { method: "POST", body: {} }).catch((e: unknown) => e);

    expect(AppError.isAppError(error)).toBe(true);
    if (!AppError.isAppError(error)) return;
    expect(error.kind).toBe("PermissionDenied");
    expect(error.code).toBe("HOST_LEVEL_REQUIRED");
    expect(error.serverMessage).toBe("등급 부족");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("401이면 refresh 한 번 뒤 원 요청을 새 토큰으로 재시도한다", async () => {
    const store = stubLocalStorage({ [REFRESH_KEY]: "old-refresh" });
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { code: "TOKEN_EXPIRED", message: "만료" }))
      .mockResolvedValueOnce(
        jsonResponse(200, { accessToken: "new-access", refreshToken: "new-refresh" }),
      )
      .mockResolvedValueOnce(jsonResponse(200, { id: 1 }));
    const { request, useAuthStore } = await loadClient();
    useAuthStore.getState().setAccessToken("old-access");

    const result = await request<{ id: number }>("/me");

    expect(result).toEqual({ id: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(3);

    const [, refreshInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    const [, retryInit] = fetchMock.mock.calls[2] as [string, RequestInit];
    expect(fetchMock.mock.calls[1][0]).toBe(`${BASE_URL}/auth/refresh`);
    expect(JSON.parse(refreshInit.body as string)).toEqual({ refreshToken: "old-refresh" });
    expect((retryInit.headers as Headers).get("Authorization")).toBe("Bearer new-access");
    expect(useAuthStore.getState().accessToken).toBe("new-access");
    expect(store.get(REFRESH_KEY)).toBe("new-refresh");
  });

  it("refresh도 실패하면 세션을 지우고 Unauthorized를 던진다 (재시도 없음)", async () => {
    const store = stubLocalStorage({ [REFRESH_KEY]: "old-refresh" });
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { code: "TOKEN_EXPIRED", message: "만료" }))
      .mockResolvedValueOnce(jsonResponse(401, { code: "REFRESH_EXPIRED", message: "만료" }));
    const { request, useAuthStore, AppError } = await loadClient();
    useAuthStore.getState().setSession("old-access", {
      nickname: "n",
      email: "e",
      role: "ADMIN",
    });

    const error = await request("/me").catch((e: unknown) => e);

    expect(AppError.isAppError(error) && error.kind).toBe("Unauthorized");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(useAuthStore.getState().status).toBe("unauthenticated");
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(store.has(REFRESH_KEY)).toBe(false);
  });

  it("403은 토큰 만료로 오인하지 않는다 — refresh를 호출하지 않는다", async () => {
    stubLocalStorage({ [REFRESH_KEY]: "old-refresh" });
    fetchMock.mockResolvedValueOnce(jsonResponse(403, { code: "FORBIDDEN", message: "거부" }));
    const { request } = await loadClient();

    await expect(request("/admin/users")).rejects.toMatchObject({ kind: "PermissionDenied" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("네트워크 실패는 NetworkError가 된다", async () => {
    stubLocalStorage({});
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    const { request } = await loadClient();

    await expect(request("/me")).rejects.toMatchObject({ kind: "NetworkError" });
  });

  it("402는 PaymentRequired가 된다", async () => {
    stubLocalStorage({});
    fetchMock.mockResolvedValueOnce(
      jsonResponse(402, { code: "PAYMENT_REQUIRED", message: "코인 부족" }),
    );
    const { request } = await loadClient();

    await expect(
      request("/rooms/1/entry-payments", { method: "POST", body: {} }),
    ).rejects.toMatchObject({ kind: "PaymentRequired", code: "PAYMENT_REQUIRED" });
  });

  it("회원 토큰이 없으면 401에 refresh를 시도하지 않고 code를 보존한다 (게스트 유료 방)", async () => {
    stubLocalStorage({});
    fetchMock.mockResolvedValueOnce(
      jsonResponse(401, { code: "LOGIN_REQUIRED", message: "로그인 필요" }),
    );
    const { request } = await loadClient();

    await expect(
      request("/rooms/1/participants", { method: "POST", body: {} }),
    ).rejects.toMatchObject({ kind: "Unauthorized", code: "LOGIN_REQUIRED" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("refresh 응답에 refreshToken이 없으면 기존 refresh 토큰을 유지한다", async () => {
    const store = stubLocalStorage({ [REFRESH_KEY]: "old-refresh" });
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { code: "TOKEN_EXPIRED", message: "만료" }))
      .mockResolvedValueOnce(jsonResponse(200, { accessToken: "new-access" }))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    const { request, useAuthStore } = await loadClient();
    useAuthStore.getState().setAccessToken("old-access");

    await request("/users/me");

    expect(store.get(REFRESH_KEY)).toBe("old-refresh");
    expect(useAuthStore.getState().accessToken).toBe("new-access");
  });

  it("동시 401 두 건이어도 refresh는 한 번만 나간다", async () => {
    stubLocalStorage({ [REFRESH_KEY]: "old-refresh" });
    const seen = new Map<string, number>();
    fetchMock.mockImplementation((url: string) => {
      if (url.endsWith("/auth/refresh"))
        return Promise.resolve(jsonResponse(200, { accessToken: "new-access" }));

      const count = (seen.get(url) ?? 0) + 1;
      seen.set(url, count);
      return Promise.resolve(
        count === 1
          ? jsonResponse(401, { code: "TOKEN_EXPIRED", message: "만료" })
          : jsonResponse(200, { ok: true }),
      );
    });
    const { request, useAuthStore } = await loadClient();
    useAuthStore.getState().setAccessToken("old-access");

    await Promise.all([request("/users/me"), request("/rooms/hosted")]);

    const refreshCalls = fetchMock.mock.calls.filter(([url]) =>
      String(url).endsWith("/auth/refresh"),
    );
    expect(refreshCalls).toHaveLength(1);
    expect(useAuthStore.getState().accessToken).toBe("new-access");
  });

  it("refresh가 5xx면 세션·리프레시 토큰을 지우지 않는다 (배포 중 게이트웨이 장애)", async () => {
    const store = stubLocalStorage({ [REFRESH_KEY]: "old-refresh" });
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { code: "TOKEN_EXPIRED", message: "만료" }))
      .mockResolvedValueOnce(jsonResponse(500, { code: "INTERNAL_ERROR", message: "서버 오류" }));
    const { request, useAuthStore, AppError } = await loadClient();
    useAuthStore.getState().setSession("old-access", {
      nickname: "n",
      email: "e",
      role: "ADMIN",
    });

    const error = await request("/users/me").catch((e: unknown) => e);

    expect(AppError.isAppError(error) && error.kind).toBe("Unauthorized");
    expect(store.get(REFRESH_KEY)).toBe("old-refresh");
    expect(useAuthStore.getState().status).toBe("authenticated");
    expect(useAuthStore.getState().accessToken).toBe("old-access");
  });

  it("회원 토큰이 없고 게스트 토큰이 있으면 게스트 토큰을 Bearer로 보낸다", async () => {
    stubLocalStorage({});
    const { request } = await loadClient();
    const { writeGuestToken } = await import("@/lib/guest-token-storage");
    writeGuestToken("guest-1");
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    await request("/rooms/1/session");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Headers).get("Authorization")).toBe("Bearer guest-1");
  });
});
