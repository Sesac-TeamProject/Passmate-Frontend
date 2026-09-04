import { Search } from "lucide-react";
import { Skeleton } from "@/components/common/skeleton";
import { cn } from "@/lib/utils";
import { RoomListItem } from "./room-list-item";
import { ROOM_FILTERS, type PublicRoomFilter, type PublicRoomItem } from "./types";

type Props = {
  rooms: PublicRoomItem[];
  query: string;
  onQueryChange: (value: string) => void;
  filter: PublicRoomFilter;
  onFilterChange: (value: PublicRoomFilter) => void;
  hasNext: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
};

function roomHref(room: PublicRoomItem) {
  // 홈 캐러셀(popular-rooms.tsx)과 같은 규칙 — 유료는 방 id, 무료는 입장 폼(F-1)
  return room.type === "paid" ? `/pay/${room.roomId}` : "/join";
}

/** P-Web 공개 방 목록 (시안 프레임 FPbky) — 검색 · 필터 칩 · 3열 카드 · 더 보기 */
export function RoomsPage({
  rooms,
  query,
  onQueryChange,
  filter,
  onFilterChange,
  hasNext,
  loadingMore,
  onLoadMore,
}: Props) {
  return (
    <main className="flex flex-col gap-5 px-20 py-7">
      <div className="flex flex-col gap-2">
        <h1 className="text-display-md text-ink">지금 열려 있는 방</h1>
        <p className="text-body-lg text-muted-foreground">
          누구나 들어갈 수 있는 공개 방이에요. PIN이 있다면 홈에서 바로 입장하세요.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <label className="flex h-12 w-[520px] max-w-full items-center gap-2 rounded-xl border bg-card px-4">
          <Search size={18} className="shrink-0 text-muted-foreground" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="방 이름 · 선생님 · 주제로 찾기"
            className="min-w-0 flex-1 bg-transparent text-body-lg text-ink outline-none placeholder:text-ink-disabled"
          />
        </label>

        {ROOM_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => onFilterChange(value)}
            className={cn(
              "h-12 w-[84px] shrink-0 rounded-xl text-label-lg transition-colors",
              filter === value
                ? "bg-mint text-white"
                : "border bg-card text-muted-foreground hover:bg-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {rooms.length === 0 ? (
        // 04 보드 C 규칙 — 왜 비었는지 + 첫 행동 하나
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-20 text-center">
          <p className="text-heading-md text-ink">
            {query.trim() ? "찾는 방이 없어요" : "지금 열려 있는 방이 없어요"}
          </p>
          <p className="text-body-md text-muted-foreground">
            {query.trim()
              ? "다른 낱말로 찾아보거나, 선생님에게 받은 PIN으로 바로 들어갈 수 있어요."
              : "선생님이 방을 열면 여기에 나타나요. PIN을 받았다면 홈에서 바로 입장하세요."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomListItem key={room.roomId} room={room} href={roomHref(room)} />
          ))}

          {/* 07 보드 "더 보기 · 무한 스크롤" — 위쪽은 건드리지 않고 끝에 스켈레톤 줄만 덧붙인다 */}
          {loadingMore
            ? Array.from({ length: 3 }, (_, i) => (
                <div
                  key={`more-${i}`}
                  className="skeleton-shimmer flex flex-col gap-3 rounded-2xl border bg-card px-5 py-[18px] opacity-70"
                >
                  <Skeleton soft className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-4 w-[72%]" />
                  <Skeleton soft className="w-[38%]" />
                  <Skeleton soft className="mt-1 h-11 w-full rounded-xl" />
                </div>
              ))
            : null}
        </div>
      )}

      {hasNext ? (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loadingMore}
          className="self-end text-label-lg text-muted-foreground hover:underline disabled:opacity-60"
        >
          {loadingMore ? "불러오는 중…" : "더 보기 ›"}
        </button>
      ) : null}
    </main>
  );
}
