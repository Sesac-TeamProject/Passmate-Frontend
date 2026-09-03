import { toAvatarKey } from "@/components/common/student-avatar";
import { parseServerDateTime } from "@/lib/datetime";
import { LEVEL_TITLE, levelTitle } from "@/lib/host-level";
import type { PayMethod } from "@/lib/portone";
import { AppError } from "@/lib/types/app-error";
import type { PaymentMethod, RoomSummaryResponse } from "@/lib/types/dto";
import { ERROR_CODES } from "@/lib/types/error-codes";
import type { PaidRoom } from "./types";

/** ISO(scheduledAt) + estimatedMinutes(분) → "8/28 (금) 20:00 · 약 40분". 일정 없으면 빈 문자열, 소요 시간 없으면 시간까지만 */
export function formatSchedule(
  scheduledAt: string | null | undefined,
  estimatedMinutes: number | null | undefined,
): string {
  if (!scheduledAt) return "";
  const date = parseServerDateTime(scheduledAt);
  if (Number.isNaN(date.getTime())) return "";

  const md = `${date.getMonth() + 1}/${date.getDate()}`;
  const weekday = new Intl.DateTimeFormat("ko-KR", { weekday: "short" }).format(date);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const base = `${md} (${weekday}) ${hh}:${mm}`;

  return estimatedMinutes != null ? `${base} · 약 ${estimatedMinutes}분` : base;
}

/**
 * GET /rooms/pin/{pin} 응답 → 방 정보 카드 뷰 타입.
 *
 * **입장 전에는 서버가 많이 알려주지 않는다** — `RoomSummaryResponse`에는 호스트·문항 수·일정이
 * 없다. 시안이 그리던 호스트 이름·별점·"문항 8개"는 지어낼 근거가 없어 비운다(DESIGN_GAPS).
 * 유료 방 자체가 아직 서버에 없어(400 `UNSUPPORTED_ROOM_TYPE`) 이 화면 전체가 `@draft`다.
 *
 * @param pin 라우트 파라미터. 응답에는 PIN이 없어 화면이 알고 있는 값을 그대로 쓴다
 */
export function toPaidRoom(room: RoomSummaryResponse, pin: string): PaidRoom {
  return {
    code: pin,
    title: room.title,
    topic: room.topic ?? "",
    composition: "",
    host: {
      name: "",
      avatar: toAvatarKey(null),
      level: 1,
      levelTitle: levelTitle(1) ?? LEVEL_TITLE[1],
    },
    rating: 0,
    students: 0,
    schedule: formatSchedule(undefined, undefined),
    capacity: { current: room.participantCount, max: room.maxParticipants ?? 0 },
    fee: room.fee ?? 0,
  };
}

/** 방 조회·코인 충전·확인·참가비 차감·입장 오류 → 화면 문구 */
export function toPayErrorMessage(error: unknown): string {
  if (!AppError.isAppError(error)) return "잠시 문제가 생겼어요. 다시 시도해 주세요.";
  if (error.code === ERROR_CODES.NICKNAME_DUPLICATED)
    return "같은 닉네임이 이미 있어요. 다른 닉네임을 써 주세요";
  if (error.kind === "PaymentRequired") return "코인이 부족해요. 충전 후 다시 시도해 주세요";
  if (error.kind === "Gone") return "이미 종료된 방이에요";
  if (error.kind === "NotFound") return "없는 방이에요";
  if (error.code === ERROR_CODES.GUEST_NOT_ALLOWED) return "로그인 후 결제할 수 있어요";
  return error.message;
}

const WIRE_METHOD_BY_PAY_METHOD: Record<PayMethod, PaymentMethod> = {
  kakaopay: "KAKAO_PAY",
  naverpay: "NAVER_PAY",
  tosspay: "TOSS_PAY",
  card: "CARD",
  transfer: "TRANSFER",
};

/** 결제 카드가 쓰는 포트원 PayMethod → 서버 전송용 PaymentMethod */
export function wireMethodFromPayMethod(method: PayMethod): PaymentMethod {
  return WIRE_METHOD_BY_PAY_METHOD[method];
}
