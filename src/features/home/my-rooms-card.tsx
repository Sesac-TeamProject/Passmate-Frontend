import { StatusChip } from "@/components/common/status-chip";
import { Button } from "@/components/ui/button";
import { formatPin } from "@/features/host/mock";
import type { MyRoom } from "@/features/host/my-rooms/mock";
import { RoomListCard, RoomListRow } from "./room-list-card";

type Props = {
  rooms: MyRoom[];
  /** 빈 상태 "첫 방 만들어보기 +" → 새 방 만들기 모달 */
  onCreate: () => void;
};

function describe(room: MyRoom) {
  const base = `학생 ${room.students}명 · ${room.questionCount}문항`;
  if (room.status === "live") return `${base} · PIN ${formatPin(room.pin ?? room.code)}`;
  return `${base} · ${room.endedLabel ?? "종료"}`;
}

/** 홈 "내가 만든 방" 카드 — 진행 중/종료 칩 + 제목 + 요약 + 열기/리포트 링크. 없으면 첫 방 만들기 CTA */
export function MyRoomsCard({ rooms, onCreate }: Props) {
  return (
    <RoomListCard
      title="내가 만든 방"
      moreHref="/host/rooms"
      moreLabel="전체 보기 ›"
      empty={
        rooms.length === 0 ? (
          <>
            <p className="text-label-lg text-ink">아직 내가 만든 방이 없어요</p>
            <p className="text-label-md text-muted-foreground">
              AI가 문제를 만들어 주니 3분이면 방을 열 수 있어요 · 무료
            </p>
            <Button
              type="button"
              onClick={onCreate}
              className="h-auto rounded-xl bg-mint px-[18px] py-2.5 text-label-lg text-white hover:bg-mint-dark"
            >
              첫 방 만들어보기 +
            </Button>
            <p className="text-label-md text-ink-disabled">
              방을 열면 선생님으로 활동이 시작되고, 명성이 쌓여요
            </p>
          </>
        ) : undefined
      }
    >
      {rooms.map((room) => (
        <RoomListRow
          key={room.code}
          leading={
            room.status === "live" ? (
              <StatusChip tone="live">진행 중</StatusChip>
            ) : (
              <StatusChip tone="ended">종료</StatusChip>
            )
          }
          title={room.title}
          description={describe(room)}
          actionHref={
            room.status === "live"
              ? `/host/rooms/${room.code}/live`
              : `/host/sessions/${room.reportId ?? room.code}/review`
          }
          actionLabel={room.status === "live" ? "열기 ›" : "리포트 ›"}
        />
      ))}
      {rooms.length > 0 && (
        <p className="text-label-md text-ink-disabled">
          새 방은 오른쪽 아래 + 버튼으로 만들 수 있어요
        </p>
      )}
    </RoomListCard>
  );
}
