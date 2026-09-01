// P-Web 공개 방 목록(/rooms) 뷰 타입. 데이터는 lib/queries → adapt.ts를 거쳐 이 모양으로 들어온다.

import type { RoomFeeType } from "@/features/home/types";

/** 카드 오른쪽 아래 상태 — 지금 들어갈 수 있는지, 나중에 열리는지 */
export type PublicRoomTiming =
  | { kind: "live" }
  /** 예정 — "20:00 시작" 처럼 이미 다듬은 문구 */
  | { kind: "scheduled"; label: string }
  /** 시각을 모를 때(scheduledAt 없음) */
  | { kind: "unknown" };

export type PublicRoomItem = {
  code: string;
  title: string;
  topic: string;
  type: RoomFeeType;
  /** 유료일 때만. 코인(1 C = ₩1) */
  entryFee: number | null;
  host: string;
  /** 계약이 안 주면 null이라 이름이 링크가 되지 않는다 */
  hostId: number | null;
  participants: number;
  timing: PublicRoomTiming;
};

export type PublicRoomFilter = "all" | "free" | "paid";

export const ROOM_FILTERS: { value: PublicRoomFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "free", label: "무료" },
  { value: "paid", label: "유료" },
  // TODO(계약): 시안에는 "오늘" 칩이 하나 더 있다. GET /rooms/public이 날짜 필터를 받지
  // 않아 뺐다 — 넣으면 누르는 순간 아무 일도 안 일어난다. DESIGN_GAPS G-4 참고.
];
