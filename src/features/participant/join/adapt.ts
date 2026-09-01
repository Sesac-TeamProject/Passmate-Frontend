import { AppError } from "@/lib/types/app-error";
import { ERROR_CODES } from "@/lib/types/error-codes";

/** 유료 방 + 게스트일 때 안내 문구 — /join·홈 PIN 카드 공용 */
export const PAID_ROOM_LOGIN_MESSAGE = "유료 방은 로그인 후 결제하고 입장할 수 있어요";

/** PIN 조회(404·410)·입장(409 NICKNAME_DUPLICATED 등) 오류 → 화면 문구 */
export function toJoinErrorMessage(error: unknown): string {
  if (!AppError.isAppError(error))
    return "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  if (error.kind === "NotFound") return "없는 PIN이에요. 다시 확인해 주세요";
  if (error.kind === "Gone") return "이미 종료된 방이에요";
  if (error.code === ERROR_CODES.NICKNAME_DUPLICATED)
    return "같은 닉네임이 이미 있어요. 다른 닉네임을 써 주세요";
  if (error.code === ERROR_CODES.GUEST_NOT_ALLOWED) return PAID_ROOM_LOGIN_MESSAGE;
  return error.message;
}
