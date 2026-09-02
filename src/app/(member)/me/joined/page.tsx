"use client";

import { useState } from "react";
import { ScreenError } from "@/components/common/screen-error";
import { toAccuracyChangeLabel, toActiveSession, toLearningRecord } from "@/features/me/adapt";
import { JoinedPage } from "@/features/me/joined/joined-page";
import { JoinedSkeleton } from "@/features/me/joined/joined-skeleton";
import { useCumulativeReport, useJoinedRooms } from "@/lib/queries/use-me";

/** W-13 참여한 방 — 참여 기록 */
export default function Page() {
  const [pageIndex, setPageIndex] = useState(0);
  const page = useJoinedRooms(pageIndex);
  // 누적 리포트는 "지난주 대비" 한 줄에만 쓴다 — 실패해도 목록은 그대로 보여준다
  const report = useCumulativeReport();

  if (page.isPending) return <JoinedSkeleton />;
  if (page.isError)
    return <ScreenError message={page.error.message} onRetry={() => page.refetch()} />;

  return (
    <JoinedPage
      learning={toLearningRecord(page.data)}
      activeSession={toActiveSession(page.data.rooms.content)}
      page={page.data.rooms.page}
      totalPages={page.data.rooms.totalPages}
      onPageChange={setPageIndex}
      accuracyChangeLabel={report.data ? toAccuracyChangeLabel(report.data) : null}
    />
  );
}
