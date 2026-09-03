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
  /** 문항 수. 서버가 세트를 연결하지 않은 방에는 값이 없다 */
  questionCount: number | null;
  participants: number;
  timing: PublicRoomTiming;
};

/** "오늘"은 다른 셋과 축이 다르다 — 유·무료 필터에 겹쳐 거는 값이라 같은 줄에 두되 따로 다룬다 */
export type PublicRoomFilter = "all" | "free" | "paid" | "today";

export const ROOM_FILTERS: { value: PublicRoomFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "free", label: "무료" },
  { value: "paid", label: "유료" },
  // 서버 `GET /rooms/public`에 `today` 파라미터가 있다 — 시안의 "오늘" 칩을 되살렸다
  { value: "today", label: "오늘" },
];
