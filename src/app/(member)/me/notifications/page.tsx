"use client";

import { useState } from "react";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toMeErrorMessage, toNotificationSettings } from "@/features/me/adapt";
import { NotificationsPage } from "@/features/me/notifications/notifications-page";
import type { NotificationKey } from "@/features/me/notifications/types";
import { useNotificationSettings, useUpdateNotificationSettings } from "@/lib/queries/use-me";

/** C-02-10 컨테이너. 토글은 즉시 반영한다(저장 버튼 없음, 낙관적 업데이트는 훅이 처리). */
export default function Page() {
  const query = useNotificationSettings();
  const update = useUpdateNotificationSettings();
  // TODO(API): DESIGN_GAPS C-5 — 마케팅 토글은 계약(NotificationSettingsDto)에 없어 로컬로만 유지한다
  const [marketing, setMarketing] = useState(false);

  const handleToggle = (key: NotificationKey, enabled: boolean) => {
    if (key === "marketing") {
      setMarketing(enabled);
      return;
    }
    if (update.isPending) return; // 진행 중인 요청이 끝난 뒤 최신 값 위에 다음 토글을 얹는다
    const current = query.data;
    update.mutate({
      sessionStart: current?.sessionStart ?? true,
      ratingRequest: current?.ratingRequest ?? true,
      settlementDone: current?.settlementDone ?? true,
      [key]: enabled,
    });
  };

  if (query.isPending) return <ScreenLoading />;
  if (query.isError)
    return <ScreenError message={query.error.message} onRetry={() => query.refetch()} />;

  return (
    <NotificationsPage
      settings={toNotificationSettings(query.data, marketing)}
      onToggle={handleToggle}
      pending={update.isPending}
      errorMessage={update.isError ? toMeErrorMessage(update.error) : null}
    />
  );
}
