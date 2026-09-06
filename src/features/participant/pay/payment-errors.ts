/**
 * 결제 경로에서 서버가 **다음 행동을 실어 보내는** 오류를 좁힌다.
 *
 * 402 `INSUFFICIENT_COINS`는 `data`에 부족분을 담아 온다 — 잔액을 다시 조회하지 말고
 * 이 값으로 충전 화면을 그린다(잔액 쿼리는 낡아 있을 수 있다).
 */
import { AppError } from "@/lib/types/app-error";
import type { InsufficientCoinsData } from "@/lib/types/dto";
import { ERROR_CODES, type ErrorCode } from "@/lib/types/error-codes";

/** 서버가 이 code로 되받았는지 */
export function isErrorCode(error: unknown, code: ErrorCode): boolean {
  return AppError.isAppError(error) && error.code === code;
}

/** 402 `INSUFFICIENT_COINS`의 부족분. 다른 오류거나 서버가 값을 안 실었으면 null */
export function toInsufficientCoins(error: unknown): InsufficientCoinsData | null {
  if (!isErrorCode(error, ERROR_CODES.INSUFFICIENT_COINS)) return null;

  const data = (error as AppError).data;
  if (typeof data !== "object" || data === null) return null;

  const { required, balance, shortfall } = data as Partial<InsufficientCoinsData>;
  if (typeof required !== "number" || typeof balance !== "number") return null;

  // shortfall이 빠져 와도 required − balance로 세울 수 있다
  return {
    required,
    balance,
    shortfall: typeof shortfall === "number" ? shortfall : required - balance,
  };
}
