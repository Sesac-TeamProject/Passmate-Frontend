"use client";

import { useEffect, useState } from "react";
import { ScreenError } from "@/components/common/screen-error";
import { toPublicRoomItems } from "@/features/participant/rooms/adapt";
import { RoomsPage } from "@/features/participant/rooms/rooms-page";
import { RoomsSkeleton } from "@/features/participant/rooms/rooms-skeleton";
import type { PublicRoomFilter } from "@/features/participant/rooms/types";
import { useInfinitePublicRooms } from "@/lib/queries/use-rooms";

/** 검색어를 글자마다 보내지 않도록 기다리는 시간 */
const SEARCH_DEBOUNCE_MS = 300;

/**
 * P-Web 공개 방 목록 컨테이너 (시안 프레임 FPbky).
 * 검색어·필터는 서버에 그대로 넘기는 질의 조건이라 URL 상태가 아닌 화면 상태로 둔다.
 */
export default function Page() {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<PublicRoomFilter>("all");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(input), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [input]);

  const rooms = useInfinitePublicRooms({ sort: "popular", type: filter, q: search });

  if (rooms.isPending) return <RoomsSkeleton />;
  if (rooms.isError)
    return <ScreenError message={rooms.error.message} onRetry={() => rooms.refetch()} />;

  const items = rooms.data.pages.flatMap((page) => page.items ?? []);

  return (
    <RoomsPage
      rooms={toPublicRoomItems(items)}
      query={input}
      onQueryChange={setInput}
      filter={filter}
      onFilterChange={setFilter}
      hasNext={rooms.hasNextPage}
      loadingMore={rooms.isFetchingNextPage}
      onLoadMore={() => rooms.fetchNextPage()}
    />
  );
}
