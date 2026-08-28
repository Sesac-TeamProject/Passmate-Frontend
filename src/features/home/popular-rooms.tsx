"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { POPULAR_PAGE_SIZE, type PopularRoom } from "./mock";
import { RoomCard } from "./room-card";

type Props = {
  rooms: PopularRoom[];
  className?: string;
};

function roomHref(room: PopularRoom) {
  // TODO(API): 무료는 PIN을 채운 입장 폼, 유료는 결제 화면 — 방 code 기준 딥링크 확정 후 조정
  return room.type === "paid" ? `/pay/${room.code}` : "/join";
}

/** 인기 방 섹션 (W-01 v6) — 3장/페이지 캐러셀. 페이지 인덱스만 갖는 UI 상태라 여기서 소유한다 */
export function PopularRooms({ rooms, className }: Props) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(rooms.length / POPULAR_PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const visible = rooms.slice(current * POPULAR_PAGE_SIZE, (current + 1) * POPULAR_PAGE_SIZE);

  const prev = () => setPage((p) => (p - 1 + pageCount) % pageCount);
  const next = () => setPage((p) => (p + 1) % pageCount);

  return (
    <section className={cn("flex w-full flex-col items-center gap-4", className)}>
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-heading-sm text-ink">인기 방</h2>
          <p className="text-label-md text-muted-foreground">운영 중인 방 {rooms.length}개</p>
        </div>
        <div className="flex items-center gap-2">
          <ArrowButton label="이전 인기 방" onClick={prev}>
            <ArrowLeft size={18} strokeWidth={2} aria-hidden />
          </ArrowButton>
          <ArrowButton label="다음 인기 방" onClick={next}>
            <ArrowRight size={18} strokeWidth={2} aria-hidden />
          </ArrowButton>
        </div>
      </div>

      <div className="flex w-full gap-4">
        {visible.map((room) => (
          <RoomCard key={room.code} room={room} href={roomHref(room)} />
        ))}
      </div>

      <div className="flex items-center gap-2" aria-hidden>
        {Array.from({ length: pageCount }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-2 rounded-full transition-all",
              i === current ? "w-5 bg-mint" : "w-2 bg-border",
            )}
          />
        ))}
      </div>
      <p className="text-label-md text-ink-disabled">← 스와이프해서 다음 인기 방 보기 →</p>
    </section>
  );
}

function ArrowButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-full bg-mint-bg text-mint-dark transition-colors outline-none hover:bg-mint-tint focus-visible:ring-2 focus-visible:ring-mint"
    >
      {children}
    </button>
  );
}
