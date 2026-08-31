import Link from "next/link";
import { Users } from "lucide-react";
import { StatusChip } from "@/components/common/status-chip";
import type { PopularRoom } from "./types";

type Props = {
  room: PopularRoom;
  /** 입장 링크 — 무료는 PIN 입장, 유료는 결제 화면 */
  href: string;
};

/** 인기 방 카드 (W-01 v6 캐러셀) — 주제·유형 칩 · 제목 · 선생님 Lv · 참여 수 · 입장 */
export function RoomCard({ room, href }: Props) {
  return (
    <article className="flex min-w-0 flex-1 flex-col gap-3 rounded-2xl border bg-card px-5 py-[18px]">
      <div className="flex items-center justify-between gap-2">
        <StatusChip tone="topic">{room.topic}</StatusChip>
        <StatusChip tone={room.type} size="lg">
          {room.type === "paid" ? "₩ 유료" : "무료"}
        </StatusChip>
      </div>
      <h3 className="truncate text-heading-md text-ink">{room.title}</h3>
      <p className="text-label-md text-muted-foreground">
        {room.host} 선생님 · Lv.{room.level}
      </p>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 text-label-md text-muted-foreground">
          <Users size={16} aria-hidden />
          {room.participants}명 참여 중
        </span>
        <Link href={href} className="text-label-lg text-mint-dark hover:underline">
          입장 ›
        </Link>
      </div>
    </article>
  );
}
