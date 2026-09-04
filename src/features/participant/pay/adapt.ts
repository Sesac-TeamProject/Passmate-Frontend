import { parseServerDateTime } from "@/lib/datetime";
import type { PayMethod } from "@/lib/portone";
import { AppError } from "@/lib/types/app-error";
import type { PaymentMethod, RoomResponse } from "@/lib/types/dto";
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
 * GET /rooms/{roomId} 응답 → 방 정보 카드 뷰 타입.
 *
 * 결제 화면은 PIN이 아니라 방 id로 열린다(F-1) — 공개 방 목록에 PIN이 없어 카드가 id밖에
 * 줄 수 없기 때문이다. 화면에 보일 PIN은 이 응답이 실어 준다.
 *
 * 호스트 정보(이름·등급·별점)와 문항 수는 이 응답에 없다 — 시안이 그리던 자리지만 지어낼
 * 근거가 없어 **비운다**(DESIGN_GAPS). 예전에는 `name: ""`·`level: 1`·`rating: 0` 같은
 * 상수를 채워 두고 화면이 이름의 빈 문자열을 보고 감췄는데, 없는 것은 없다고 적는 편이 낫다.
 *
 * 일정(`scheduledAt`)은 **응답에 있다** — 예전 주석이 "없다"고 적어 두는 바람에
 * `formatSchedule(undefined, undefined)`로 늘 빈 문자열을 만들고 있었다(QA_BACKLOG F-8).
 * 소요 시간은 계약에 없어 시간까지만 그린다.
 */
export function toPaidRoom(room: RoomResponse): PaidRoom {
  return {
    code: room.pin,
    title: room.title,
    topic: room.topic ?? "",
    composition: "",
    host: null,
    schedule: formatSchedule(room.scheduledAt, undefined),
    capacity: { current: room.participantCount, max: room.maxParticipants ?? 0 },
    fee: room.fee ?? 0,
  };
}

/** 결제 화면이 무엇을 그릴지 — 결제 폼 · 대기실로 보냄 · 닫힘 안내 */
export type PayGate = "payable" | "free" | "closed";

/**
 * 결제 폼을 그려도 되는 방인지.
 *
 * PIN 조회(`GET /rooms/pin/{pin}`)는 활성 방만 주고 끝난 방을 404로 막아 줬다. id 조회
 * (`GET /rooms/{roomId}`)에는 그 안전망이 없어 **ENDED·CANCELED도 200으로 온다** — 그대로 두면
 * 끝난 방에 결제 폼이 뜬다. 서버도 참가 단계에서 409로 막지만, 돈 내는 화면을 보여 준 뒤에
 * 막는 것은 늦다.
 *
 * 상태를 유·무료보다 먼저 본다 — 끝난 무료 방을 대기실로 보내지 않기 위해서다.
 */
export function toPayGate(room: RoomResponse): PayGate {
  if (room.status !== "WAITING" && room.status !== "RUNNING") return "closed";
  return room.type === "PAID" ? "payable" : "free";
}

/** 방 조회·코인 충전·확인·참가비 차감·입장 오류 → 화면 문구 */
export function toPayErrorMessage(error: unknown): string {
  if (!AppError.isAppError(error)) return "잠시 문제가 생겼어요. 다시 시도해 주세요.";
  if (error.code === ERROR_CODES.NICKNAME_DUPLICATED)
    return "같은 닉네임이 이미 있어요. 다른 닉네임을 써 주세요";
  if (error.code === ERROR_CODES.ENTRY_FEE_REQUIRED) return "참가비 결제가 필요한 방이에요";
  if (error.kind === "PaymentRequired") return "코인이 부족해요. 충전 후 다시 시도해 주세요";
  if (error.code === ERROR_CODES.REFUND_WINDOW_CLOSED)
    return "세션이 시작돼 참가를 취소할 수 없어요";
  if (error.code === ERROR_CODES.PAYMENT_NOT_COMPLETED)
    return "결제를 확인하고 있어요. 잠시 뒤 코인이 들어와요";
  if (error.code === ERROR_CODES.PAYMENT_AMOUNT_MISMATCH)
    return "결제 금액이 맞지 않아 충전하지 못했어요. 고객센터로 알려 주세요";
  if (error.kind === "Gone") return "이미 종료된 방이에요";
  if (error.kind === "NotFound") return "없는 방이에요";
  if (error.code === ERROR_CODES.GUEST_NOT_ALLOWED) return "로그인 후 결제할 수 있어요";
  return error.message;
}

const WIRE_METHOD_BY_PAY_METHOD: Record<PayMethod, PaymentMethod> = {
  kakaopay: "KAKAOPAY",
  naverpay: "NAVERPAY",
  tosspay: "TOSSPAY",
  card: "CARD",
  transfer: "BANK_TRANSFER",
};

/** 결제 카드가 쓰는 포트원 PayMethod → 서버 전송용 PaymentMethod */
export function wireMethodFromPayMethod(method: PayMethod): PaymentMethod {
  return WIRE_METHOD_BY_PAY_METHOD[method];
}
