"use client";

import { ScreenError } from "@/components/common/screen-error";
import {
  toLevelStatus,
  toMyRoomStats,
  toMyRooms,
  toPromotion,
} from "@/features/host/my-rooms/adapt";
import { MyRoomsPage } from "@/features/host/my-rooms/my-rooms-page";
import { MyRoomsSkeleton } from "@/features/host/my-rooms/my-rooms-skeleton";
import { useHostedRooms } from "@/lib/queries/use-rooms";

/**
 * W-09 내가 만든 방 컨테이너.
 * 명성 요약(등급·누적 학생·별점)이 방 목록과 **같은 응답**에 들어 있다 —
 * 별도 등급 API(`/users/me/grade`)는 백엔드에 없어 부르지 않는다.
 */
export default function Page() {
  const hostedRooms = useHostedRooms();

  if (hostedRooms.isPending) return <MyRoomsSkeleton />;
  if (hostedRooms.isError)
    return (
      <ScreenError message={hostedRooms.error.message} onRetry={() => hostedRooms.refetch()} />
    );

  const { reputation } = hostedRooms.data;
  const rooms = toMyRooms(hostedRooms.data);

  return (
    <MyRoomsPage
      rooms={rooms}
      stats={toMyRoomStats(rooms, reputation)}
      level={toLevelStatus(reputation)}
      promotion={toPromotion(reputation)}
    />
  );
}
