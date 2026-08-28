// 데이터 연동 전 화면 확인용 목업 (W-11 유료 방 결제 — 코인 충전 → 차감).
import type { AvatarKey } from "@/components/common/student-avatar";

export type PaidRoom = {
  code: string;
  title: string;
  /** 주제. 예: "백엔드" */
  topic: string;
  /** 문항 구성. 예: "객관식 6 + 서술형 2" */
  composition: string;
  host: { name: string; avatar: AvatarKey; level: number; levelTitle: string };
  rating: number;
  students: number;
  /** 예: "8/28 (금) 20:00 · 약 40분" */
  schedule: string;
  capacity: { current: number; max: number };
  /** 참가비(코인, 1 C = ₩1) */
  fee: number;
};

// TODO(API): 방 조회(/rooms/[code]) 계약 확정 후 lib/queries로 대체
export const PAID_ROOM: PaidRoom = {
  code: "DEMO01",
  title: "Spring 실전 모의고사 4주차",
  topic: "백엔드",
  composition: "객관식 6 + 서술형 2",
  // 시안 W-11 방 정보 카드의 호스트 — 로그인 회원(이한결)이 아니라 다른 선생님
  host: {
    name: "김민지",
    avatar: "fox",
    level: 3,
    levelTitle: "검증된 운영자",
  },
  rating: 4.5,
  students: 312,
  schedule: "8/28 (금) 20:00 · 약 40분",
  capacity: { current: 24, max: 40 },
  fee: 10000,
};

// TODO(API): 코인 잔액 조회 계약 확정 후 lib/queries로 대체
export const COIN_BALANCE = 1200;

/** 충전 금액 선택지(코인) */
export const CHARGE_OPTIONS = [10000, 30000, 50000] as const;

/** 참가자 정보 기본값 — 로그인 회원(이한결)의 닉네임·캐릭터 */
export const PARTICIPANT_DEFAULT: { nickname: string; avatar: AvatarKey } = {
  nickname: "한결",
  avatar: "cat",
};
