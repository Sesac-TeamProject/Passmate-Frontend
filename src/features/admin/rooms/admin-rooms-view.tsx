import { formatNumber } from "@/lib/format";
import type { AdminReviewQueueResponse, AdminRoomsResponse } from "@/lib/types/dto";
import { AdminCard } from "../components/admin-card";
import { AdminCardHead } from "../components/admin-card-head";
import { ReviewQueueTable } from "./review-queue-table";
import { RoomTable } from "./room-table";

type Props = {
  rooms: AdminRoomsResponse;
  queue: AdminReviewQueueResponse;
};

/** A-03 방 · 문제 관리 렌더 전용 뷰. 두 쿼리 결과를 page가 props로 넘긴다 (규칙 문서 §11-1). */
export function AdminRoomsView({ rooms, queue }: Props) {
  const { live, waiting, endedToday } = rooms.summary;
  const roomHint = `진행 중 ${formatNumber(live)} · 대기 ${formatNumber(waiting)} · 오늘 종료 ${formatNumber(endedToday)}`;

  return (
    <div className="flex flex-1 flex-col gap-[14px] px-7 pt-4 pb-[14px]">
      <AdminCard>
        <AdminCardHead title="방 목록" hint={roomHint} />
        <RoomTable rooms={rooms.items} />
      </AdminCard>
      <AdminCard className="min-h-0 flex-1">
        <AdminCardHead title="문제 검수 큐" hint="AI 생성 문제 · 신고 누적 또는 정답률 이상" />
        <ReviewQueueTable questions={queue.items} />
      </AdminCard>
    </div>
  );
}
