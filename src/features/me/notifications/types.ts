// 알림 설정(C-02-10) 뷰 타입. API 응답 → 이 타입 변환은 ../adapt.ts가 맡는다.

export type NotificationKey = "sessionStart" | "ratingRequest" | "settlementDone" | "marketing";

export type NotificationSetting = {
  key: NotificationKey;
  title: string;
  description: string;
  enabled: boolean;
};

/**
 * 알림 항목 라벨 — 정책·카피라 서버 데이터가 아닌 UI 상수로 둔다.
 * 계약(NotificationSettingsDto)은 3종뿐이라 marketing은 켜고 끄는 값만 로컬 상태로 관리한다 (DESIGN_GAPS C-5).
 */
export const NOTIFICATION_LABEL: Record<NotificationKey, { title: string; description: string }> = {
  sessionStart: { title: "세션 시작", description: "참여한 방이 시작되면 알려줘요" },
  ratingRequest: { title: "별점 요청", description: "방이 끝나면 선생님 평가를 요청해요" },
  settlementDone: { title: "정산 완료", description: "정산금이 입금되면 알려줘요" },
  marketing: { title: "마케팅 · 이벤트", description: "새 기능과 이벤트 소식" },
};
