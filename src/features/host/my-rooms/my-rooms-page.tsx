import Link from "next/link";
import { HubActions, type HubAction } from "./hub-actions";
import { HubSummary, type HubStat } from "./hub-summary";
import { ReputationCard } from "./reputation-card";
import { RoomListCard } from "./room-list-card";
import type { LevelStatus, MyRoom } from "./types";

type Props = {
  rooms: MyRoom[];
  /** 헤드라인 윗줄 "누적 학생 수 : 312명" */
  totalStudents: number;
  level: LevelStatus;
  /** 명성 카드 부제 "방 운영 24회 · 평균 평가 4.6" */
  levelSubtitle: string;
  stats: HubStat[];
  actions: HubAction[];
};

/** W-09 내가 만든 방 — 허브 (시안 803:8751). 렌더 전용 */
export function MyRoomsPage({ rooms, totalStudents, level, levelSubtitle, stats, actions }: Props) {
  return (
    // 시안 W-09 프레임 바탕은 흰색이다 — 앱 기본 회색(bg-background)이 아니다
    <main className="min-h-screen bg-card px-[60px] pt-12 pb-10">
      {/* 시안은 1440에서 본문 1080 — 더 넓은 화면에서 가운데 칸만 늘어나지 않게 폭을 묶는다 */}
      <div className="flex max-w-[1080px] flex-col gap-8">
        {/* 시안은 세로 막대를 본문 칸 왼쪽 바깥(x=272)에 걸어 둔다 — 글자는 아래 카드들과 같은 300에서 시작 */}
        <header className="relative mb-6 flex flex-col gap-1.5">
          <span aria-hidden className="absolute top-1 -left-7 h-16 w-[3px] bg-ink" />
          <p className="text-label-lg text-mint-dark">누적 학생 수 : {totalStudents}명</p>
          <h1 className="text-heading-lg text-ink">방 한 번 열면, 출제부터 리포트까지 끝!</h1>
        </header>

        <div className="flex gap-9">
          <ReputationCard status={level} subtitle={levelSubtitle} detailHref="/host/reputation" />
          <HubSummary stats={stats} links={SUMMARY_LINKS} />
          <HubActions actions={actions} />
        </div>

        <section className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2.5">
            <h2 className="text-label-lg text-ink">내 방</h2>
            <span className="text-label-md text-ink-disabled">{rooms.length}</span>
          </div>

          {rooms.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-[14px] border border-dashed py-16 text-center">
              <p className="text-body-md text-muted-foreground">아직 만든 방이 없어요</p>
              <Link
                href="/host/rooms/new"
                className="flex h-11 items-center rounded-[14px] bg-mint px-6 text-label-lg text-white transition-colors hover:bg-mint-dark"
              >
                새 방 만들기
              </Link>
            </div>
          ) : (
            <RoomListCard rooms={rooms} />
          )}
        </section>
      </div>
    </main>
  );
}

/** 가운데 요약 아래 바로가기 — 시안 803:8815·8817 */
const SUMMARY_LINKS = [
  { label: "문제 세트", href: "/host/sets" },
  { label: "정산 내역", href: "/me/settlement" },
];
