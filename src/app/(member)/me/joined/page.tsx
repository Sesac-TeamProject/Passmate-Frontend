"use client";

import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toActiveSession, toLearningRecord } from "@/features/me/adapt";
import { JoinedPage } from "@/features/me/joined/joined-page";
import { useMyPage } from "@/lib/queries/use-me";

/** W-13 참여한 방 — 참여 기록 */
export default function Page() {
  const page = useMyPage();

  if (page.isPending) return <ScreenLoading />;
  if (page.isError)
    return <ScreenError message={page.error.message} onRetry={() => page.refetch()} />;

  return (
    <JoinedPage
      learning={toLearningRecord(page.data)}
      activeSession={toActiveSession(page.data.ongoing)}
    />
  );
}
