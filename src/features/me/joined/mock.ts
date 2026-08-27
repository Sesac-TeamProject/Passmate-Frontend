// 데이터 연동 전 화면 확인용 목업 (W-13 참여한 방 — 참여 기록).
// 통계·보완할 주제·세션 목록은 features/me/mock.ts의 LEARNING_RECORD를 그대로 쓴다.

/** 지금 진행 중이라 다시 들어갈 수 있는 세션. 없으면 카드를 숨긴다. */
export type ActiveSession = {
  /** 방 코드 — /play/[code] */
  code: string;
  /** 6자리 PIN(숫자 문자열). 표기는 host/mock의 formatPin */
  pin: string;
  title: string;
  hostName: string;
  progress: { current: number; total: number };
};

// TODO(API): 참여 중 세션 조회 계약 확정 후 lib/queries로 대체
export const ACTIVE_SESSION: ActiveSession | null = {
  code: "DEMO01",
  pin: "482913",
  title: "Spring 실전 모의고사 4주차",
  hostName: "김선생",
  progress: { current: 3, total: 8 },
};
