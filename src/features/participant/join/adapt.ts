import { AppError } from "@/lib/types/app-error";
import { ERROR_CODES } from "@/lib/types/error-codes";
import type { RoomSummaryResponse } from "@/lib/types/dto";

/** 게스트가 못 들어가는 방(유료)일 때 안내 문구 — /join·홈 PIN 카드 공용 */
export const PAID_ROOM_LOGIN_MESSAGE = "유료 방은 로그인 후 결제하고 입장할 수 있어요";

/**
 * PIN 조회·입장 실패 → 화면 문구. HTTP 숫자가 아니라 서버 `code`로 분기한다(규칙 §10).
 *
 * **410 분기는 없앴다** — 끝난 방의 PIN도 서버는 404 `ROOM_NOT_FOUND`로 답한다.
 * "없는 PIN"과 "끝난 방"을 가를 근거가 응답에 없어 한 문구로 합친다(백엔드 질문 B-4).
 */
export function toJoinErrorMessage(error: unknown): string {
  if (!AppError.isAppError(error)) return "잠시 문제가 생겼어요. 다시 시도해 주세요.";

  switch (error.code) {
    case ERROR_CODES.ROOM_NOT_FOUND:
      return "없거나 이미 끝난 방이에요. PIN을 다시 확인해 주세요";
    case ERROR_CODES.NICKNAME_DUPLICATED:
      return "같은 닉네임이 이미 있어요. 다른 닉네임을 써 주세요";
    case ERROR_CODES.ROOM_FULL:
      return "정원이 가득 찼어요. 선생님께 문의해 주세요";
    case ERROR_CODES.ROOM_NOT_JOINABLE:
      return "지금은 들어갈 수 없는 방이에요";
    case ERROR_CODES.ALREADY_JOINED:
      return "이미 들어와 있는 방이에요";
    case ERROR_CODES.GUEST_NOT_ALLOWED:
      return PAID_ROOM_LOGIN_MESSAGE;
    default:
      // code가 없는 실패(네트워크 등)는 kind 기본 문구로 — NotFound는 위 code와 같은 뜻이다
      return error.kind === "NotFound"
        ? "없거나 이미 끝난 방이에요. PIN을 다시 확인해 주세요"
        : error.message;
  }
}

/** 입장 전 방 미리보기 — PIN을 다 넣으면 보여 줄 한 줄 */
export type RoomPreview = {
  title: string;
  topic: string;
  /** 유료 방이면 게스트가 못 들어간다 */
  guestAllowed: boolean;
  fee: number | null;
  capacity: string;
};

/** GET /rooms/pin/{pin} → 입장 화면 미리보기. 호스트·문항 수는 응답에 없다 */
export function toRoomPreview(room: RoomSummaryResponse): RoomPreview {
  return {
    title: room.title,
    topic: room.topic ?? "",
    guestAllowed: room.guestAllowed,
    fee: room.type === "PAID" ? (room.fee ?? null) : null,
    capacity: room.maxParticipants
      ? `${room.participantCount}/${room.maxParticipants}명`
      : `${room.participantCount}명 참여 중`,
  };
}
