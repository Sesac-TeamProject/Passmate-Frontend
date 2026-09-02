import Link from "next/link";
import { cn } from "@/lib/utils";
import type { MyRoom } from "./types";

type Props = { rooms: MyRoom[] };

/** W-09 "내 방" 목록 — 진행 중 줄은 왼쪽에 민트 막대가 붙는다 (시안 803:8834) */
export function RoomListCard({ rooms }: Props) {
  return (
    <ul className="flex flex-col overflow-hidden rounded-[14px] border bg-card">
      {rooms.map((room) => {
        const live = room.status === "live";

        return (
          <li
            key={room.code || room.reportId}
            className="relative flex items-center gap-5 border-b border-line-soft px-6 py-[15px] last:border-b-0"
          >
            {live && <span aria-hidden className="absolute top-0 left-0 h-full w-[3px] bg-mint" />}

            <span
              className={cn(
                "flex h-6.5 w-[62px] shrink-0 items-center justify-center rounded-full text-label-md",
                live ? "bg-mint-bg text-mint-dark" : "bg-background text-ink-disabled",
              )}
            >
              {live ? "진행 중" : "종료"}
            </span>

            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="truncate text-label-lg text-ink">{room.title}</span>
              <span className="truncate text-label-md text-muted-foreground">{describe(room)}</span>
            </span>

            {live ? (
              <Link
                href={`/host/rooms/${room.code}/live`}
                className="shrink-0 text-label-md text-mint-dark transition-colors hover:text-mint"
              >
                진행 화면 열기 ›
              </Link>
            ) : (
              <Link
                href={`/host/sessions/${room.reportId ?? room.code}/review`}
                className="shrink-0 text-label-md text-muted-foreground transition-colors hover:text-ink"
              >
                리포트 ›
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * 줄 아래 메타 — 진행 중은 "학생 24명 · 8문항 · PIN 482 913 · 20:00 시작",
 * 종료는 "8/19 · 학생 9명 · 평균 77%". 없는 조각은 통째로 뺀다.
 */
function describe(room: MyRoom): string {
  const parts =
    room.status === "live"
      ? [
          `학생 ${room.students}명`,
          room.questionCount === undefined ? null : `${room.questionCount}문항`,
          room.pin === undefined ? null : `PIN ${room.pin.slice(0, 3)} ${room.pin.slice(3)}`,
          room.startsLabel ?? null,
        ]
      : [
          room.endedLabel ?? null,
          `학생 ${room.students}명`,
          room.averageScore === undefined ? null : `평균 ${room.averageScore}%`,
        ];

  return parts.filter((part): part is string => part !== null && part !== "").join(" · ");
}
