import { avatarKeyFromId } from "@/components/common/student-avatar";
import type { PayMethod } from "@/lib/portone";
import { AppError } from "@/lib/types/app-error";
import type { PaymentMethod, RoomInfoResponse } from "@/lib/types/dto";
import { ERROR_CODES } from "@/lib/types/error-codes";
import { LEVEL_TITLE, type PaidRoom } from "./types";

/** ISO(scheduledAt) + estimatedMinutes(분) → "8/28 (금) 20:00 · 약 40분". 일정 없으면 빈 문자열, 소요 시간 없으면 시간까지만 */
export function formatSchedule(
  scheduledAt: string | null | undefined,
  estimatedMinutes: number | null | undefined,
): string {
  if (!scheduledAt) return "";
  const date = new Date(scheduledAt);
  if (Number.isNaN(date.getTime())) return "";

  const md = `${date.getMonth() + 1}/${date.getDate()}`;
  const weekday = new Intl.DateTimeFormat("ko-KR", { weekday: "short" }).format(date);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const base = `${md} (${weekday}) ${hh}:${mm}`;

  return estimatedMinutes != null ? `${base} · 약 ${estimatedMinutes}분` : base;
}

/** GET /rooms/pin/{pin} 응답 → 방 정보 카드 뷰 타입 */
export function toPaidRoom(room: RoomInfoResponse): PaidRoom {
  const level = room.host?.level ?? 1;

  return {
    code: room.pin,
    title: room.title,
    topic: room.topic ?? "",
    composition: room.questionCount ? `문항 ${room.questionCount}개` : "",
    host: {
      name: room.host?.nickname ?? "",
      // 계약에 호스트 avatarId가 없다 — 공개 프로필에도 아직 없어 기본 아바타로 접는다.
      avatar: avatarKeyFromId(null),
      level,
      levelTitle: LEVEL_TITLE[level] ?? LEVEL_TITLE[1],
    },
    rating: room.host?.avgStars ?? 0,
    students: room.host?.ratingCount ?? 0,
    schedule: formatSchedule(room.scheduledAt, room.estimatedMinutes),
    capacity: { current: room.participantCount ?? 0, max: room.maxParticipants ?? 0 },
    fee: room.entryFee ?? 0,
  };
}

/** 방 조회·코인 충전·확인·참가비 차감·입장 오류 → 화면 문구 */
export function toPayErrorMessage(error: unknown): string {
  if (!AppError.isAppError(error))
    return "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  if (error.code === ERROR_CODES.NICKNAME_TAKEN)
    return "같은 닉네임이 이미 있어요. 다른 닉네임을 써 주세요";
  if (error.kind === "PaymentRequired") return "코인이 부족해요. 충전 후 다시 시도해 주세요";
  if (error.kind === "Gone") return "이미 종료된 방이에요";
  if (error.kind === "NotFound") return "없는 방이에요";
  if (error.code === ERROR_CODES.LOGIN_REQUIRED) return "로그인 후 결제할 수 있어요";
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
