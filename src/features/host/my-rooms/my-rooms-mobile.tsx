import Link from "next/link";
import { LevelEmblem } from "@/features/me/level-emblem";
import { cn } from "@/lib/utils";
import type { LevelStatus, MyRoom } from "./types";

type Props = {
  rooms: MyRoom[];
  level: LevelStatus | null;
  /** "방 운영 12회 · 별점 4.3 · 학생 98명" */
  levelSubtitle: string;
};

/**
 * M-13 내가 만든 방 (앱) — 시안 v6 `03 · 앱` 384:5121. 렌더 전용.
 *
 * 웹 W-09(행동 카드 3 · 요약 · 목록)와 내용은 같지만 배치가 다르다. 폰은 한 줄에 하나씩 쌓고,
 * 방을 **진행 중 / 종료** 두 묶음으로 나눠 머리글에 개수를 적는다. 새 방 만들기는 목록에 섞지 않고
 * 오른쪽 아래 FAB으로 뺀다 — 목록이 길어져도 자리가 고정된다.
 */
export function MyRoomsMobile({ rooms, level, levelSubtitle }: Props) {
  const live = rooms.filter((r) => r.status === "live");
  const ended = rooms.filter((r) => r.status === "ended");

  return (
    <div className="flex flex-1 flex-col gap-3 px-5 pt-2 pb-5">
      {level !== null && (
        <section className="rounded-2xl border bg-card px-4 py-1">
          <div className="flex items-center justify-between py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <LevelEmblem level={level.level} size={40} />
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="truncate text-label-lg text-ink">
                  Lv.{level.level} {level.title}
                </p>
                <p className="truncate text-label-md text-muted-foreground">{levelSubtitle}</p>
              </div>
            </div>
            <Link
              href="/host/reputation"
              className="shrink-0 text-label-md text-mint-dark transition-colors hover:text-mint"
            >
              명성 상세 ›
            </Link>
          </div>
        </section>
      )}

      <RoomGroup tone="live" rooms={live} />
      <RoomGroup tone="ended" rooms={ended} />

      {rooms.length === 0 && (
        <p className="rounded-2xl border border-dashed px-4 py-14 text-center text-label-lg text-muted-foreground">
          아직 만든 방이 없어요
        </p>
      )}
    </div>
  );
}

/** 진행 중 · 종료 묶음. 비면 그리지 않는다 — 빈 묶음 머리글만 남으면 "0개"가 사실처럼 읽힌다 */
function RoomGroup({ tone, rooms }: { tone: "live" | "ended"; rooms: MyRoom[] }) {
  if (rooms.length === 0) return null;

  const isLive = tone === "live";

  return (
    <section className="overflow-hidden rounded-2xl border bg-card">
      <div
        className={cn(
          "flex items-center gap-2 px-3.5 py-2.5",
          isLive ? "bg-mint-bg" : "bg-surface-subtle",
        )}
      >
        <span
          className={cn(
            "rounded-full px-2 py-[3px] text-label-md",
            isLive ? "bg-mint text-white" : "bg-muted text-muted-foreground",
          )}
        >
          {isLive ? "진행 중" : "종료"}
        </span>
        <span className="text-label-md text-muted-foreground">{rooms.length}개</span>
      </div>

      <ul>
        {rooms.map((room) => (
          <li key={room.code} className="border-t">
            <Link
              href={roomHref(room)}
              className="flex items-center justify-between gap-3 px-3.5 py-3 transition-colors hover:bg-muted"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-label-lg text-ink">{room.title}</span>
                <span className="truncate text-label-md text-muted-foreground">{toMeta(room)}</span>
              </span>
              <span className="shrink-0 text-label-md text-mint-dark">
                {isLive ? "진행 ›" : room.canceled ? "취소됨" : "상세 ›"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 진행 중 "학생 24명 · PIN 482 913 · 20:00 시작" · 종료 "8/19 · 학생 9명 · 평균 77%" — 없는 조각은 뺀다 */
function toMeta(room: MyRoom): string {
  const parts =
    room.status === "live"
      ? [`학생 ${room.students}명`, room.pin ? `PIN ${room.pin}` : null, room.startsLabel ?? null]
      : [
          room.endedLabel ?? null,
          `학생 ${room.students}명`,
          room.averageScore === undefined ? null : `평균 ${room.averageScore}%`,
        ];

  return parts.filter((p): p is string => p !== null).join(" · ");
}

/** 진행 중은 대기실·진행 화면으로, 종료는 리포트로. 취소된 방은 리포트가 없어 목록에 머문다 */
function roomHref(room: MyRoom): string {
  if (room.status === "live") {
    return room.phase === "RUNNING"
      ? `/host/rooms/${room.code}/live`
      : `/host/rooms/${room.code}/lobby`;
  }

  return room.canceled || room.reportId === undefined
    ? "/host/rooms"
    : `/host/sessions/${room.reportId}/review`;
}
