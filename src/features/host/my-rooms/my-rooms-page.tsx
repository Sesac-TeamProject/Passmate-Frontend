import Link from "next/link";
import { HeroBanner } from "@/components/common/hero-banner";
import { StatCards, type StatItem } from "@/components/common/stat-cards";
import { LevelCard } from "./level-card";
import { PromotionCard } from "./promotion-card";
import { RoomListCard } from "./room-list-card";
import type { LevelStatus, MyRoom, Promotion } from "./types";

type Props = {
  rooms: MyRoom[];
  stats: StatItem[];
  /** 등급은 서버가 아직 계산하지 않는다 — 없으면 카드를 그리지 않는다 */
  level: LevelStatus | null;
  promotion: Promotion | null;
};

const NEW_ROOM_ACTION = (
  <Link
    href="/host/rooms/new"
    className="flex h-[52px] shrink-0 items-center rounded-2xl bg-mint px-6 text-heading-sm text-white transition-colors hover:bg-mint-dark"
  >
    +&nbsp;&nbsp;새 방 만들기
  </Link>
);

/** W-09 내가 만든 방 (시안 voPdY) — 배너 · 통계 3장 · 명성 레벨/승급 조건 · 진행 중/종료 방 목록 */
export function MyRoomsPage({ rooms, stats, level, promotion }: Props) {
  const liveRooms = rooms.filter((r) => r.status === "live");
  const endedRooms = rooms.filter((r) => r.status === "ended");

  return (
    <main className="flex flex-col gap-6 px-9 py-7">
      <HeroBanner
        title="내가 만든 방"
        description="방 하나가 세션 하나예요 — 종료하면 끝나고, 종료된 방은 상세 보기에서 리포트를 봐요"
        action={NEW_ROOM_ACTION}
      />

      <StatCards stats={stats} />

      {/*
        등급·승급 카드는 서버가 등급을 계산할 때까지 그리지 않는다.
        Lv.1·0%로 채우면 "새싹 등급을 받았고 진행률이 0"이라는 없는 사실이 된다.
      */}
      {level && promotion ? (
        <div className="flex gap-4">
          <LevelCard status={level} />
          <PromotionCard
            targetLevel={promotion.targetLevel}
            rules={promotion.rules}
            note={promotion.note}
          />
        </div>
      ) : null}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-heading-sm text-ink">내가 만든 방</h2>
            <span className="text-label-md text-muted-foreground">
              {rooms.length}개 · 진행 중 {liveRooms.length}
            </span>
          </div>
          <p className="text-label-md text-mint-dark">방 하나 = 세션 하나 · 종료하면 끝나요</p>
        </div>
        {rooms.length === 0 ? (
          // TODO(design): DESIGN_GAPS W-09 빈 상태
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center">
            <p className="text-body-md text-muted-foreground">아직 만든 방이 없어요</p>
            {NEW_ROOM_ACTION}
          </div>
        ) : (
          <>
            <RoomListCard status="live" summary={`${liveRooms.length}개`} rooms={liveRooms} />
            <RoomListCard
              status="ended"
              summary={`${endedRooms.length}개 · 종료된 방은 상세 보기에서 리포트를 확인해요`}
              rooms={endedRooms}
            />
          </>
        )}
      </section>
    </main>
  );
}
