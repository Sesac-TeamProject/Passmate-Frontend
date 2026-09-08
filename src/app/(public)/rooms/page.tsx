"use client";

import { useEffect, useState } from "react";
import { ScreenError } from "@/components/common/screen-error";
import { toPublicRoomItems } from "@/features/participant/rooms/adapt";
import { RoomsPage } from "@/features/participant/rooms/rooms-page";
import { RoomsSkeleton } from "@/features/participant/rooms/rooms-skeleton";
import type { PublicRoomFilter } from "@/features/participant/rooms/types";
import { useInfinitePublicRooms } from "@/lib/queries/use-rooms";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { PublicRoomSearch } from "@/lib/types/dto";

/** 검색어를 글자마다 보내지 않도록 기다리는 시간 */
const SEARCH_DEBOUNCE_MS = 300;

/** 화면 칩 → 서버 쿼리. enum은 대문자이고, "오늘"은 유형이 아니라 별도 파라미터다 */
function toFilterQuery(filter: PublicRoomFilter): Pick<PublicRoomSearch, "type" | "today"> {
  if (filter === "free") return { type: "FREE" };
  if (filter === "paid") return { type: "PAID" };
  if (filter === "today") return { today: true };
  return {};
}

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

  // 세션 복원이 끝난 뒤에 묻는다 — 복원 전에는 회원 토큰이 아직 없어 요청이 방에 들어갔다 나온
  // 게스트 토큰을 대신 달고 나갔고, 그 첫 응답(403)이 화면에 굳었다(2026-09-09 시나리오 테스트 S-07).
  // 복원이 끝나면 회원은 자기 토큰으로, 비회원은 토큰 없이 같은 목록을 본다
  const authStatus = useAuthStore((s) => s.status);
  const rooms = useInfinitePublicRooms(
    { sort: "POPULAR", q: search, ...toFilterQuery(filter) },
    { enabled: authStatus === "authenticated" || authStatus === "unauthenticated" },
  );

  if (rooms.isPending) return <RoomsSkeleton />;
  if (rooms.isError)
    return <ScreenError message={rooms.error.message} onRetry={() => rooms.refetch()} />;

  const items = rooms.data.pages.flatMap((page) => page.content);

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
