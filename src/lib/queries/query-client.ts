import { QueryClient } from "@tanstack/react-query";
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

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: STALE_TIME_MS, retry: shouldRetry },
      mutations: { retry: false },
    },
  });
}
