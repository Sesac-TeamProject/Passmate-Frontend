// W-11 유료 방 결제 뷰 타입. API 응답 → 이 타입 변환은 ./adapt.ts가 맡는다.
import type { AvatarKey } from "@/components/common/student-avatar";

export type PaidRoom = {
  code: string;
  title: string;
  /** 주제. 예: "백엔드" */
  topic: string;
  /** 문항 구성. 예: "문항 8개" */
  composition: string;
  /**
   * 호스트 정보는 방 응답에 없다(`hostUserId`만 온다) — **통째로 없다**.
   * 이름만 빈 문자열로 두고 등급·별점을 1·0으로 채우면 있지도 않은 사실을 만든다.
   */
  host: {
    name: string;
    avatar: AvatarKey;
    level: number;
    levelTitle: string;
    rating: number;
    students: number;
  } | null;
  /** 예: "8/28 (금) 20:00 · 약 40분" */
  schedule: string;
  capacity: { current: number; max: number };
  /** 참가비(코인, 1 C = ₩1) */
  fee: number;
};

/** 충전 금액 선택지(코인) — 서버 데이터가 아니라 화면 정책 */
export const CHARGE_OPTIONS = [10000, 30000, 50000] as const;
