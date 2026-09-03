// W-13 참여한 방 — 참여 기록 뷰 타입. API 응답 → 이 타입 변환은 ../adapt.ts가 맡는다.

/**
 * 지금 들어갈 수 있는 방. 없으면 카드를 숨긴다.
 *
 * **PIN·진행률은 서버가 주지 않는다** — 참여한 방 목록은 `roomId`만 준다.
 * 그래서 카드에서 바로 방으로 들어가지 못하고 PIN 입력 화면으로 보낸다.
 */
export type ActiveSession = {
  roomId: number;
  title: string;
  hostName: string;
  /** 이미 시작한 방인가 — 문구를 "진행 중"·"대기 중"으로 가른다 */
  isRunning: boolean;
};
