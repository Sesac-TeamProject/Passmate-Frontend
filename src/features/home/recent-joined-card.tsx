import { Mascot } from "@/components/common/mascot";
import type { AttendedSession } from "@/features/me/mock";
import { RoomListCard, RoomListRow } from "./room-list-card";

type Props = {
  sessions: AttendedSession[];
};

/** 홈 "최근 참여한 방" 카드 — 순위 칩 + 제목 + "날짜 · N문항 · N점" + 리포트 링크. 없으면 마스코트 빈 상태 */
export function RecentJoinedCard({ sessions }: Props) {
  return (
    <RoomListCard
      title="최근 참여한 방"
      moreHref="/me/joined"
      moreLabel="참여 기록 더보기 ›"
      empty={
        sessions.length === 0 ? (
          <>
            <Mascot className="h-auto w-[72px]" />
            <p className="text-label-lg text-ink">아직 참여한 방이 없어요</p>
            <p className="text-label-md text-muted-foreground">
              위에서 PIN을 입력하면 첫 방에 바로 들어갈 수 있어요
            </p>
          </>
        ) : undefined
      }
    >
      {sessions.map((s) => (
        <RoomListRow
          key={s.id}
          leading={
            <span className="flex h-7 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-label-lg text-ink">
              {s.rank}위
            </span>
          }
          title={s.title}
          description={`${s.dateLabel} · ${s.questionCount}문항 · ${s.score.toLocaleString("ko-KR")}점`}
          actionHref={`/result/${s.id}`}
          actionLabel="리포트 ›"
        />
      ))}
    </RoomListCard>
  );
}
