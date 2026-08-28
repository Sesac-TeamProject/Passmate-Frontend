// 데이터 연동 전 화면 확인용 목업 (W-10 정산). 정산 계좌는 features/me/mock.ts의 SETTLEMENT_ACCOUNT를 쓴다.
import type { StatItem } from "@/components/common/stat-cards";
import { formatWon } from "@/features/me/mock";

export type SettlementStatus = "scheduled" | "paid";

export const SETTLEMENT_STATUS_LABEL: Record<SettlementStatus, string> = {
  scheduled: "정산 예정",
  paid: "지급 완료",
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
  /** 플랫폼 수수료 20%(원) */
  fee: number;
  /** 정산액 80%(원) */
  payout: number;
  status: SettlementStatus;
};

// TODO(API): GET /me/settlements
export const SETTLEMENT_ROWS: SettlementRow[] = [
  {
    id: "1",
    dateLabel: "8/22",
    roomTitle: "8월 4주차 Spring 스터디",
    participants: 6,
    gross: 60000,
    fee: 12000,
    payout: 48000,
    status: "scheduled",
  },
  {
    id: "2",
    dateLabel: "8/20",
    roomTitle: "CS 모의면접 3회차",
    participants: 5,
    gross: 50000,
    fee: 10000,
    payout: 40000,
    status: "scheduled",
  },
  {
    id: "3",
    dateLabel: "8/15",
    roomTitle: "JPA 심화 2회차",
    participants: 4,
    gross: 40000,
    fee: 8000,
    payout: 32000,
    status: "paid",
  },
  {
    id: "4",
    dateLabel: "8/08",
    roomTitle: "Spring 기술면접 1회차",
    participants: 8,
    gross: 80000,
    fee: 16000,
    payout: 64000,
    status: "paid",
  },
];

// TODO(API): 정산 요약 (시안 값 — 표 4행 합계와 일치하지 않는다, 기획 확인)
export const SETTLEMENT_STATS: StatItem[] = [
  {
    id: "revenue",
    label: "이번 달 수익 (선생님 80%)",
    value: formatWon(384000, true),
    tile: { label: "₩", tone: "mint" },
  },
  {
    id: "next-payout",
    label: "다음 지급 (9/5)",
    value: formatWon(307200, true),
    tile: { label: "D", tone: "blue" },
  },
  {
    id: "paid-rooms",
    label: "유료 방 운영",
    value: "12회 · 48명",
    tile: { label: "R", tone: "orange" },
  },
];
