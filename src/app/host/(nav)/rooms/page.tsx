"use client";

import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import {
  toLevelStatus,
  toMyRoomStats,
  toMyRooms,
  toPromotion,
} from "@/features/host/my-rooms/adapt";
import { MyRoomsPage } from "@/features/host/my-rooms/my-rooms-page";
import { useGrade } from "@/lib/queries/use-me";
import { useHostedRooms } from "@/lib/queries/use-rooms";

/** W-09 내가 만든 방 컨테이너 — 내가 만든 방·명성 등급을 읽어 화면 뷰 타입으로 바꾼다 */
export default function Page() {
  const hostedRooms = useHostedRooms();
  const grade = useGrade();

  if (hostedRooms.isPending || grade.isPending) return <ScreenLoading />;
  if (hostedRooms.isError)
    return (
      <ScreenError message={hostedRooms.error.message} onRetry={() => hostedRooms.refetch()} />
    );

  // 등급 조회가 실패해도 방 목록은 보여준다 — 레벨·승급 카드만 기본값(Lv.1)으로 접힌다.
  const rooms = toMyRooms(hostedRooms.data.items ?? []);

  return (
    <MyRoomsPage
      rooms={rooms}
      stats={toMyRoomStats(rooms, grade.data)}
      level={toLevelStatus(grade.data)}
      promotion={toPromotion(grade.data)}
    />
  );
}
