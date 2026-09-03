// W-10 정산 뷰 타입. API 응답(PayoutStatus) → 이 타입 변환은 ../adapt.ts가 맡는다.

export type SettlementStatus = "scheduled" | "paid" | "held" | "carried";

export const SETTLEMENT_STATUS_LABEL: Record<SettlementStatus, string> = {
  scheduled: "정산 예정",
  paid: "지급 완료",
  // TODO(design): DESIGN_GAPS W-10 보류·이월 — 시안에 없던 상태. 계약 PayoutStatus.HELD를 우선 "보류"로 표기한다
  held: "보류",
  carried: "이월",
};

/** 결제 · 정산 내역 한 행 — 유료 방 1회분 */
export type SettlementRow = {
  id: string;
  /** "8/22" */
  dateLabel: string;
  roomTitle: string;
  /** 참가 인원 */
  participants: number;
  /** 참가비 합계(원) */
  gross: number;
  /** 플랫폼 수수료(원) */
  fee: number;
  /** 정산액(원) */
  payout: number;
  status: SettlementStatus;
};
