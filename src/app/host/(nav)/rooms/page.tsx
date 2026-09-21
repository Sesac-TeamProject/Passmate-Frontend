"use client";

import { useState } from "react";
import { ScreenError } from "@/components/common/screen-error";
import {
  toHubActions,
  toHubStats,
  toLevelStatus,
  toLevelSubtitle,
  toMyRooms,
} from "@/features/host/my-rooms/adapt";
import { MyRoomsPage } from "@/features/host/my-rooms/my-rooms-page";
import { MyRoomsSkeleton } from "@/features/host/my-rooms/my-rooms-skeleton";
import { NewRoomSheetLoader } from "@/features/host/room-flow/new-room-sheet-loader";
import { useEarnings } from "@/lib/queries/use-payments";
import { useHostedRooms } from "@/lib/queries/use-rooms";

/**
 * W-09 내가 만든 방 허브 컨테이너.
 * 명성(등급·누적 학생·평균 별점)은 방 목록과 **같은 응답**에 들어 있어 따로 부르지 않는다.
 * 이번 달 정산액만 별도 조회다.
 */
export default function Page() {
  const hostedRooms = useHostedRooms();
  const earnings = useEarnings();
  const [sheetOpen, setSheetOpen] = useState(false);
  // 한 번 열고 나면 마운트한 채 둔다 — 닫기 애니메이션이 끝까지 돌고, 다시 열 때 조회가 이미 끝나 있다
  const [sheetMounted, setSheetMounted] = useState(false);

  if (hostedRooms.isPending) return <MyRoomsSkeleton />;
  if (hostedRooms.isError)
    return (
      <ScreenError message={hostedRooms.error.message} onRetry={() => hostedRooms.refetch()} />
    );

  // 정산 조회가 실패해도 방 목록은 보여준다 — 정산 줄만 "—"로 접힌다.
  const { reputation } = hostedRooms.data;
  const rooms = toMyRooms(hostedRooms.data);

  return (
    <>
      <MyRoomsPage
        rooms={rooms}
        totalStudents={reputation.totalStudentCount}
        level={toLevelStatus(reputation)}
        levelSubtitle={toLevelSubtitle(reputation)}
        stats={toHubStats(reputation, earnings.data?.thisMonthNet)}
        actions={toHubActions(rooms)}
        onCreateRoom={() => {
          setSheetMounted(true);
          setSheetOpen(true);
        }}
      />
      {sheetMounted && <NewRoomSheetLoader open={sheetOpen} onOpenChange={setSheetOpen} />}
    </>
  );
}
