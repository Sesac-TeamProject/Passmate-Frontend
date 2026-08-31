"use client";

import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { AdminPageHeader } from "@/features/admin/layout/admin-page-header";
import { AdminRoomsView } from "@/features/admin/rooms/admin-rooms-view";
import { useAdminReviewQueue } from "@/lib/queries/use-admin-review-queue";
import { useAdminRooms } from "@/lib/queries/use-admin-rooms";

const ROUTE_PATH = "/admin/rooms";

/** A-03 컨테이너. 방 목록·검수 큐 두 쿼리를 묶어 로딩·에러를 화면 단위로 분기한다. */
export default function Page() {
  const rooms = useAdminRooms();
  const queue = useAdminReviewQueue();

  const isPending = rooms.isPending || queue.isPending;
  const error = rooms.error ?? queue.error;

  const handleRetry = () => {
    if (rooms.isError) void rooms.refetch();
    if (queue.isError) void queue.refetch();
  };

  let body: React.ReactNode;
  if (isPending) {
    body = <ScreenLoading />;
  } else if (error || !rooms.data || !queue.data) {
    body = <ScreenError message={error?.message ?? "불러오지 못했습니다."} onRetry={handleRetry} />;
  } else {
    body = <AdminRoomsView rooms={rooms.data} queue={queue.data} />;
  }

  return (
    <>
      <AdminPageHeader path={ROUTE_PATH} />
      {body}
    </>
  );
}
