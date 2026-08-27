"use client";

import { useState } from "react";
import {
  NOTIFICATION_SETTINGS,
  type NotificationKey,
  type NotificationSetting,
} from "@/features/me/notifications/mock";
import { NotificationsPage } from "@/features/me/notifications/notifications-page";

/** C-02-10 컨테이너. 토글 상태를 소유하고 즉시 반영한다(저장 버튼 없음). */
export default function Page() {
  // TODO(API): ['me','notifications'] 쿼리 + 토글 뮤테이션(낙관적 업데이트, 실패 시 롤백)으로 교체
  const [settings, setSettings] = useState<NotificationSetting[]>(NOTIFICATION_SETTINGS);

  const handleToggle = (key: NotificationKey, enabled: boolean) => {
    // TODO: 브라우저 알림은 처음 켤 때 Notification.requestPermission() 호출
    setSettings((prev) =>
      prev.map((setting) => (setting.key === key ? { ...setting, enabled } : setting)),
    );
  };

  return <NotificationsPage settings={settings} onToggle={handleToggle} />;
}
