// 데이터 연동 전 화면 확인용 목업 (알림 설정 C-02-10).
// TODO(API): 알림 설정 DTO 계약이 없다 — lib/types/dto.ts 갱신 후 lib/queries 로 교체한다.

export type NotificationKey = "sessionStart" | "ratingRequest" | "settlementDone" | "marketing";

export type NotificationSetting = {
  key: NotificationKey;
  title: string;
  description: string;
  enabled: boolean;
};

export const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    key: "sessionStart",
    title: "세션 시작",
    description: "참여한 방이 시작되면 알려줘요",
    enabled: true,
  },
  {
    key: "ratingRequest",
    title: "별점 요청",
    description: "방이 끝나면 선생님 평가를 요청해요",
    enabled: true,
  },
  {
    key: "settlementDone",
    title: "정산 완료",
    description: "정산금이 입금되면 알려줘요",
    enabled: true,
  },
  {
    key: "marketing",
    title: "마케팅 · 이벤트",
    description: "새 기능과 이벤트 소식",
    enabled: false,
  },
];
