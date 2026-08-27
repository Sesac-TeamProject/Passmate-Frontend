import Link from "next/link";
import { HeroBanner } from "@/components/common/hero-banner";
import { StatCards } from "@/components/common/stat-cards";
import { LevelCard } from "./level-card";
import { LEVEL_STATUS, MY_ROOMS, MY_ROOMS_STATS, PROMOTION } from "./mock";
import { PromotionCard } from "./promotion-card";
import { RoomListCard } from "./room-list-card";

/** W-09 내가 만든 방 (시안 voPdY) — 배너 · 통계 3장 · 명성 레벨/승급 조건 · 진행 중/종료 방 목록 */
export function MyRoomsPage() {
  // TODO(API): 목 대신 lib/queries의 내가 만든 방·명성 조회 훅으로 교체
  const liveRooms = MY_ROOMS.filter((r) => r.status === "live");
  const endedRooms = MY_ROOMS.filter((r) => r.status === "ended");

  return (
    <main className="flex flex-col gap-6 px-9 py-7">
      <HeroBanner
        title="내가 만든 방"
        description="방 하나가 세션 하나예요 — 종료하면 끝나고, 종료된 방은 상세 보기에서 리포트를 봐요"
        action={
          // TODO: 새 방 만들기 모달은 홈(W-01 v6)에 있다. 모달 공용화 후 여기서 바로 연다.
          <Link
            href="/home"
            className="flex h-[52px] shrink-0 items-center rounded-2xl bg-mint px-6 text-heading-sm text-white transition-colors hover:bg-mint-dark"
          >
            +&nbsp;&nbsp;새 방 만들기
          </Link>
        }
      />

      <StatCards stats={MY_ROOMS_STATS} />

      <div className="flex gap-4">
        <LevelCard status={LEVEL_STATUS} />
        <PromotionCard
          targetLevel={PROMOTION.targetLevel}
          rules={PROMOTION.rules}
          note={PROMOTION.note}
        />
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-heading-sm text-ink">내가 만든 방</h2>
            <span className="text-label-md text-muted-foreground">
              {MY_ROOMS.length}개 · 진행 중 {liveRooms.length}
            </span>
          </div>
          <p className="text-label-md text-mint-dark">방 하나 = 세션 하나 · 종료하면 끝나요</p>
        </div>
        <RoomListCard status="live" summary={`${liveRooms.length}개`} rooms={liveRooms} />
        <RoomListCard
          status="ended"
          summary={`${endedRooms.length}개 · 종료된 방은 상세 보기에서 리포트를 확인해요`}
          rooms={endedRooms}
        />
      </section>
    </main>
  );
}
