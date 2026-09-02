"use client";

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
import { useGrade } from "@/lib/queries/use-me";
import { useEarnings } from "@/lib/queries/use-payments";
import { useHostedRooms } from "@/lib/queries/use-rooms";

/** W-09 내가 만든 방 허브 컨테이너 — 방 목록·명성 등급·이번 달 정산액을 읽어 화면 뷰 타입으로 바꾼다 */
export default function Page() {
  const hostedRooms = useHostedRooms();
  const grade = useGrade();
  const earnings = useEarnings();

  if (hostedRooms.isPending || grade.isPending) return <MyRoomsSkeleton />;
  if (hostedRooms.isError)
    return (
      <ScreenError message={hostedRooms.error.message} onRetry={() => hostedRooms.refetch()} />
    );

  // 등급·정산 조회가 실패해도 방 목록은 보여준다 — 명성 카드와 정산 줄만 기본값으로 접힌다.
  const rooms = toMyRooms(hostedRooms.data.items ?? []);

  return (
    <MyRoomsPage
      rooms={rooms}
      totalStudents={grade.data?.stats?.totalStudents ?? 0}
      level={toLevelStatus(grade.data)}
      levelSubtitle={toLevelSubtitle(grade.data)}
      stats={toHubStats(grade.data, earnings.data?.monthlyTotal)}
      actions={toHubActions(rooms)}
    />
  );
}
