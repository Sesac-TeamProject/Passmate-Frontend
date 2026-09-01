import Link from "next/link";
import { Users } from "lucide-react";
import { StatusChip } from "@/components/common/status-chip";
import { formatKrwInline } from "@/lib/format";
import type { PublicRoomItem } from "./types";

type Props = {
  room: PublicRoomItem;
  /** 입장 링크 — 무료는 PIN 입장, 유료는 결제 화면 */
  href: string;
};

/** P-Web 공개 방 목록 카드 (시안 프레임 FPbky) — 배지 · 제목 · 선생님 · 참여 수 · 시각 · CTA */
export function RoomListItem({ room, href }: Props) {
  const isLive = room.timing.kind === "live";

  return (
    <article className="flex min-w-0 flex-col gap-3 rounded-2xl border bg-card px-5 py-[18px]">
      <div className="flex items-center justify-between gap-2">
        <StatusChip tone={room.type}>
          {room.type === "paid"
            ? room.entryFee != null
              ? `유료 · ${formatKrwInline(room.entryFee)}`
              : "유료"
            : "무료"}
        </StatusChip>
        {room.topic ? <StatusChip tone="topic">{room.topic}</StatusChip> : null}
      </div>

      <h3 className="truncate text-heading-md text-ink">{room.title}</h3>

      <p className="truncate text-label-md text-muted-foreground">
        {room.hostId === null ? (
          `${room.host} 선생님`
        ) : (
          <Link href={`/hosts/${room.hostId}`} className="hover:underline">
            {room.host} 선생님
          </Link>
        )}
      </p>

      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 text-label-md text-muted-foreground">
          <Users size={16} aria-hidden />
          {room.participants}명
        </span>
        {isLive ? (
          <span className="text-label-lg text-mint-dark">진행 중</span>
        ) : room.timing.kind === "scheduled" ? (
          <span className="text-label-lg text-ink">{room.timing.label}</span>
        ) : null}
      </div>

      {isLive ? (
        <Link
          href={href}
          className="flex h-11 items-center justify-center rounded-xl bg-mint text-label-lg text-white transition-colors hover:bg-mint-dark"
        >
          지금 입장하기
        </Link>
      ) : (
        // TODO(계약): 시안은 예정 방에 [알림 받기]를 둔다. 예약 알림 구독 API가 없어
        // 지금은 방 정보로만 보낸다 — DESIGN_GAPS G-4 회신이 오면 버튼으로 바꾼다.
        <Link
          href={href}
          className="flex h-11 items-center justify-center rounded-xl border text-label-lg text-ink transition-colors hover:bg-muted"
        >
          방 정보 보기
        </Link>
      )}
    </article>
  );
}
