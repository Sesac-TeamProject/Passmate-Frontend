import { API_BASE_URL, IS_MOCK } from "@/lib/env";
import { readGuestToken } from "@/lib/guest-token-storage";
import { resolveMock } from "@/lib/mocks/handlers";
import { useAuthStore } from "@/lib/stores/auth-store";
import { clearRefreshToken, readRefreshToken, writeRefreshToken } from "@/lib/token-storage";
import { AppError } from "@/lib/types/app-error";
import { ERROR_CODES } from "@/lib/types/error-codes";
import type { ApiErrorBody, TokenRefreshRequest, TokenRefreshResponse } from "@/lib/types/dto";

/**
 * fetch 공통 래퍼 (설계 문서 §2, 규칙 문서 §5).
 * 담당: baseURL · 인증 헤더 · 401 → refresh 1회 → 재시도 · `{code,message}` → AppError · 파일 다운로드.
 * 403은 권한 거부로만 해석하고 refresh하지 않는다 (만료는 항상 401).
 * refresh까지 실패하면 세션만 비운다(400·401·403일 때만 — 5xx는 일시 장애로 보고 토큰을 남긴다).
 * `/login?next=` 이동은 UI 층의 RequireAuth 가드가 status를 보고 한다.
 */
const REFRESH_PATH = "/auth/refresh";
const HTTP_UNAUTHORIZED = 401;
/** refresh 응답이 이 상태면 리프레시 토큰이 죽은 것 — 저장분을 지운다. 그 밖(5xx 등)은 일시 장애로 본다. */
const SESSION_KILLING_STATUSES = [400, 401, 403];
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

  if (IS_MOCK) return resolveMock<T>(method, url, options.body);

  const response = await sendWithRefresh(url, path, options);

  if (response.status === HTTP_NO_CONTENT) return undefined as T;

  return (await response.json()) as T;
}

/**
 * 인증 헤더를 실어 blob을 받아 저장한다 (설계 문서 §7, FR-063).
 *
 * **목 계층을 타지 않는다** — 목은 파일을 만들 수 없다. 목 모드에서는 라우트가 있는 척하지 않고
 * NotFound로 알려, 화면이 다른 미구현 API와 같은 "준비 중" 안내로 접게 한다.
 */
export async function downloadFile(path: string, filename: string): Promise<void> {
  if (IS_MOCK) {
    throw new AppError("NotFound", { code: ERROR_CODES.NOT_FOUND, serverMessage: null });
  }

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

/** multipart/form-data (PTT 클립·자료 업로드). Content-Type은 브라우저가 boundary와 함께 붙인다. */
export async function requestMultipart<T>(path: string, form: FormData): Promise<T> {
  const url = buildUrl(path);

  if (IS_MOCK) return resolveMock<T>("POST", url, form);

  const response = await sendWithRefresh(url, path, { method: "POST", body: form });

  if (response.status === HTTP_NO_CONTENT) return undefined as T;

  return (await response.json()) as T;
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
  const isFormData = options.body instanceof FormData;
  const bearer = accessToken ?? readGuestToken();

  if (options.body !== undefined && !isFormData) headers.set("Content-Type", "application/json");
  if (bearer) headers.set("Authorization", `Bearer ${bearer}`);

  try {
    return await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body: isFormData
        ? (options.body as FormData)
        : options.body === undefined
          ? undefined
          : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch (cause) {
    throw AppError.network(cause);
  }
}

/**
 * 401이면 refresh 후 한 번만 재시도한다. 성공 응답(2xx)만 돌려주고 나머지는 AppError로 던진다.
 * 회원 토큰(store.accessToken)이 있을 때만 refresh를 시도한다 — 게스트·비로그인 401(예: GUEST_NOT_ALLOWED)은
 * refresh 대상이 아니므로 code를 보존한 채 그대로 AppError로 바꾼다.
 */
async function sendWithRefresh(url: string, path: string, options: RequestOptions) {
  const store = useAuthStore.getState();
  let response = await send(url, options, store.accessToken);

  if (
    response.status === HTTP_UNAUTHORIZED &&
    store.accessToken !== null &&
    path !== REFRESH_PATH
  ) {
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

  // 여기까지 왔다는 건 access 토큰이 있던 살아 있는 세션이었다는 뜻이다 — 만료로 표시한다.
  if (!refreshToken) {
    store.expireSession();
    return null;
  }

  const body: TokenRefreshRequest = { refreshToken };
  const response = await send(buildUrl(REFRESH_PATH), { method: "POST", body }, null);

  if (!response.ok) {
    // 리프레시 토큰이 실제로 죽은 응답(400·401·403)에서만 세션을 비운다 — KMP ApiClient와 같은 기준.
    // 5xx·게이트웨이 오류에도 지우면 배포 중 한 번의 500으로 열린 탭이 전부 로그아웃된다(복구 불가).
    if (SESSION_KILLING_STATUSES.includes(response.status)) {
      store.expireSession();
      clearRefreshToken();
    }
    return null;
  }

  const tokens = (await response.json()) as TokenRefreshResponse;

  store.setAccessToken(tokens.accessToken);
  if (tokens.refreshToken) writeRefreshToken(tokens.refreshToken);

  return tokens.accessToken;
}
