import Link from "next/link";
import { StatusChip } from "@/components/common/status-chip";
import { formatPin } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MyRoom, MyRoomStatus } from "./types";

type Props = {
  status: MyRoomStatus;
  /** 헤더 칩 옆 안내. 예: "1개", "3개 · 종료된 방은 …" */
  summary: string;
  rooms: MyRoom[];
};

const CHIP_LABEL: Record<MyRoomStatus, string> = { live: "진행 중", ended: "종료" };

/** 시안 헤더 배경 — 진행 중 mint-bg · 종료 #fafafb(토큰 없음 → bg-background 근사) */
const HEADER_CLASS: Record<MyRoomStatus, string> = {
  live: "bg-mint-bg",
  ended: "bg-background",
};

function subtitle(room: MyRoom): string {
  if (room.status === "live") {
    return [
      `학생 ${room.students}명 참여 중`,
      // 계약에 방별 문항 수가 없다 — 값이 있을 때만 보여준다
      room.questionCount !== undefined && `${room.questionCount}문항`,
      room.pin && `PIN ${formatPin(room.pin)}`,
      room.startsLabel,
    ]
      .filter(Boolean)
      .join(" · ");
  }
  return [room.endedLabel, `학생 ${room.students}명`, `평균 ${room.averageScore}%`]
    .filter(Boolean)
    .join(" · ");
}

function action(room: MyRoom): { href: string; label: string } {
  if (room.status === "live") {
    return { href: `/host/rooms/${room.code}/live`, label: "진행 화면 열기 ›" };
  }
  return { href: `/host/sessions/${room.reportId || "1"}/review`, label: "상세 보기 ›" };
}

/** W-09 방 목록 카드 — 상태 칩 헤더 + h64 행(제목·부제 / 우측 220px 텍스트 링크) */
export function RoomListCard({ status, summary, rooms }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border bg-card">
      <div className={cn("flex items-center gap-2.5 px-5 py-3", HEADER_CLASS[status])}>
        <StatusChip tone={status}>{CHIP_LABEL[status]}</StatusChip>
        <span className="text-label-md text-muted-foreground">{summary}</span>
      </div>
      <ul>
        {rooms.map((room) => {
          const { href, label } = action(room);
          // 종료된 방은 pin이 없어 code가 비어 있을 수 있다 — reportId(항상 고유)를 key로 우선한다
          const key = room.reportId || room.code || room.title;
          return (
            <li key={key} className="flex h-16 items-center justify-between gap-4 border-t px-5">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-label-lg text-ink">{room.title}</span>
                <span className="truncate text-label-md text-muted-foreground">
                  {subtitle(room)}
                </span>
              </div>
              <div className="flex w-[220px] shrink-0 justify-end">
                <Link
                  href={href}
                  className="text-label-md text-mint-dark transition-colors hover:text-mint-deep"
                >
                  {label}
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
