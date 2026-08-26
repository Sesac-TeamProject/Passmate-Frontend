/** 방 만들기 플로우 3단계 (W-02 방 정보 → W-03 문제 준비 → W-04 대기실) */
export const ROOM_FLOW_STEPS = [
  { step: 1, label: "방 정보" },
  { step: 2, label: "문제 준비" },
  { step: 3, label: "대기실" },
] as const;

export type RoomFlowStep = (typeof ROOM_FLOW_STEPS)[number]["step"];
