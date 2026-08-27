import { API_BASE_URL, IS_MOCK } from "@/lib/env";
import { resolveMock } from "@/lib/mocks/handlers";
import { useAuthStore } from "@/lib/stores/auth-store";
import { clearRefreshToken, readRefreshToken, writeRefreshToken } from "@/lib/token-storage";
import { AppError } from "@/lib/types/app-error";
import type { ApiErrorBody, RefreshTokenRequest, TokenPair } from "@/lib/types/dto";

/**
 * fetch 공통 래퍼 (설계 문서 §2, 규칙 문서 §5).
 * 담당: baseURL · 인증 헤더 · 401 → refresh 1회 → 재시도 · `{code,message}` → AppError · 파일 다운로드.
 * 403은 권한 거부로만 해석하고 refresh하지 않는다 (만료는 항상 401).
 * refresh까지 실패하면 세션만 비운다 — `/login?next=` 이동은 UI 층의 RequireAuth 가드가 status를 보고 한다.
 */
const REFRESH_PATH = "/auth/refresh";
const HTTP_UNAUTHORIZED = 401;
const HTTP_NO_CONTENT = 204;

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type QueryValue = string | number | boolean | null | undefined;

export type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
};

/** JSON 요청·응답. 204는 undefined를 돌려준다. */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const url = buildUrl(path, options.query);

  if (IS_MOCK) return resolveMock<T>(method, url);

  const response = await sendWithRefresh(url, path, options);

  if (response.status === HTTP_NO_CONTENT) return undefined as T;

  return (await response.json()) as T;
}

/** 인증 헤더를 실어 blob을 받아 저장한다 (설계 문서 §7, FR-063). */
export async function downloadFile(path: string, filename: string): Promise<void> {
  const url = buildUrl(path);
  const response = await sendWithRefresh(url, path, {});
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

/* ── 내부 ─────────────────────────────────────────────── */

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) params.set(key, String(value));
  }

  const qs = params.toString();
  return `${API_BASE_URL}${path}${qs ? `?${qs}` : ""}`;
}

async function send(url: string, options: RequestOptions, accessToken: string | null) {
  const headers = new Headers();

  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  try {
    return await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch (cause) {
    throw AppError.network(cause);
  }
}

/** 401이면 refresh 후 한 번만 재시도한다. 성공 응답(2xx)만 돌려주고 나머지는 AppError로 던진다. */
async function sendWithRefresh(url: string, path: string, options: RequestOptions) {
  const store = useAuthStore.getState();
  let response = await send(url, options, store.accessToken);

  if (response.status === HTTP_UNAUTHORIZED && path !== REFRESH_PATH) {
    const refreshed = await refreshAccessToken();

    if (!refreshed) throw new AppError("Unauthorized", { status: HTTP_UNAUTHORIZED });

    response = await send(url, options, refreshed);
  }

  if (!response.ok) throw await toAppError(response);

  return response;
}

async function toAppError(response: Response): Promise<AppError> {
  let body: ApiErrorBody | null = null;

  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    body = null;
  }

  return AppError.fromResponse(response.status, body);
}

/** 동시 401이 여러 개여도 refresh는 한 번만 나간다. */
let refreshing: Promise<string | null> | null = null;

function refreshAccessToken(): Promise<string | null> {
  if (!refreshing) {
    refreshing = doRefresh().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

async function doRefresh(): Promise<string | null> {
  const store = useAuthStore.getState();
  const refreshToken = readRefreshToken();

  if (!refreshToken) {
    store.clearSession();
    return null;
  }

  const body: RefreshTokenRequest = { refreshToken };
  const response = await send(buildUrl(REFRESH_PATH), { method: "POST", body }, null);

  if (!response.ok) {
    store.clearSession();
    clearRefreshToken();
    return null;
  }

  const tokens = (await response.json()) as TokenPair;

  store.setAccessToken(tokens.accessToken);
  writeRefreshToken(tokens.refreshToken);

  return tokens.accessToken;
}
