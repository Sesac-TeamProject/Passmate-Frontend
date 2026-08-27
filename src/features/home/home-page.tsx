import { HeroBanner } from "@/components/common/hero-banner";
import type { MyRoom } from "@/features/host/my-rooms/mock";
import type { AttendedSession } from "@/features/me/mock";
import type { JoinValues } from "@/features/participant/join/join-form";
import { CreateRoomFab } from "./fab";
import type { PopularRoom } from "./mock";
import { MyRoomsCard } from "./my-rooms-card";
import { PinEntryCard } from "./pin-entry-card";
import { PopularRooms } from "./popular-rooms";
import { RecentJoinedCard } from "./recent-joined-card";

type Props = {
  /** 배너 호칭. 예: "한결" */
  name: string;
  popularRooms: PopularRoom[];
  recentSessions: AttendedSession[];
  myRooms: MyRoom[];
  join: {
    values: JoinValues;
    onChange: (next: JoinValues) => void;
    onSubmit: () => void;
    pending?: boolean;
  };
  /** FAB · 빈 상태 CTA → 새 방 만들기 모달 */
  onCreateRoom: () => void;
};

/** W-01 v6 홈 — PIN 입장 · 인기 방 · 최근 참여한 방 / 내가 만든 방 · + 새 방. 렌더 전용 */
export function HomePage({
  name,
  popularRooms,
  recentSessions,
  myRooms,
  join,
  onCreateRoom,
}: Props) {
  return (
    <main className="flex flex-col gap-6 px-24 py-7">
      <HeroBanner
        title={`안녕하세요, ${name} 님!`}
        description="오늘도 스터디원들과 실전처럼 연습해 보세요"
      />

      <PinEntryCard
        values={join.values}
        onChange={join.onChange}
        onSubmit={join.onSubmit}
        pending={join.pending}
      />

      <PopularRooms rooms={popularRooms} />

      <div className="flex gap-5">
        <RecentJoinedCard sessions={recentSessions} />
        <MyRoomsCard rooms={myRooms} onCreate={onCreateRoom} />
      </div>

      <CreateRoomFab onClick={onCreateRoom} />
    </main>
  );
}
