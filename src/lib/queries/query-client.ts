import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { useServiceStatusStore } from "@/lib/stores/service-status-store";
import { AppError, type AppErrorKind } from "@/lib/types/app-error";

/** useQuery의 error 타입을 AppError로 고정한다 (전송 층이 항상 AppError로 변환하므로). */
declare module "@tanstack/react-query" {
  interface Register {
    defaultError: AppError;
  }
}

const STALE_TIME_MS = 30_000;
const MAX_RETRY = 2;

/** 재시도해도 결과가 같은 실패. 네트워크·서버 오류만 재시도한다. */
const NON_RETRYABLE: readonly AppErrorKind[] = [
  "Unauthorized",
  "PermissionDenied",
  "PaymentRequired",
  "ValidationFailed",
  "NotFound",
  "Conflict",
  "Gone",
];

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (AppError.isAppError(error) && NON_RETRYABLE.includes(error.kind)) return false;
  return failureCount < MAX_RETRY;
}

/**
 * 503만 앱 전체 상태로 올린다 — E-500(점검 중)은 화면 하나가 아니라 앱이 통째로 못 도는 상황이다.
 * 성공이 한 번이라도 오면 되살아난 것으로 보고 내린다.
 */
function trackServiceStatus(error: unknown) {
  if (AppError.isAppError(error) && error.kind === "ServiceUnavailable") {
    useServiceStatusStore.getState().markUnavailable();
  }
}

function clearServiceStatus() {
  useServiceStatusStore.getState().clear();
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({ onError: trackServiceStatus, onSuccess: clearServiceStatus }),
    mutationCache: new MutationCache({
      onError: trackServiceStatus,
      onSuccess: clearServiceStatus,
    }),
    defaultOptions: {
      queries: { staleTime: STALE_TIME_MS, retry: shouldRetry },
      mutations: { retry: false },
    },
  });
}
