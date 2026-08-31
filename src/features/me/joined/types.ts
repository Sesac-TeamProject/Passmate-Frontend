// W-13 참여한 방 — 참여 기록 뷰 타입. API 응답 → 이 타입 변환은 ../adapt.ts가 맡는다.

/** 지금 진행 중이라 다시 들어갈 수 있는 세션. 없으면 카드를 숨긴다. */
export type ActiveSession = {
  /** 방 코드 — /play/[code]. 계약에는 pin만 있어 code와 값이 같다 */
  code: string;
  /** 6자리 PIN(숫자 문자열). 표기는 lib/format의 formatPin */
  pin: string;
  title: string;
  hostName: string;
  progress: { current: number; total: number };
};
