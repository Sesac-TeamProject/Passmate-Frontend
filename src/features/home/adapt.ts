import type { PublicRoomResponse } from "@/lib/types/dto";
import type { PopularRoom } from "./types";

/**
 * GET /rooms/public 항목 → 인기 방 카드.
 *
 * 응답에 **PIN이 없다** — 무료 방은 입장 폼에서 PIN을 받아야 하고, 유료 방은 결제 화면을
 * 방 id로 연다(F-1). 그래서 카드가 싣는 식별자는 `roomId` 하나다.
 * 호스트 등급은 이 응답에 없어 비운다.
 */
export function toPopularRooms(items: PublicRoomResponse[]): PopularRoom[] {
  return items.map((room) => ({
    roomId: room.id,
    topic: room.topic ?? "",
    type: room.type === "PAID" ? "paid" : "free",
    title: room.title,
    host: room.host.nickname,
    hostId: room.host.userId,
    level: null,
    participants: room.participantCount,
  }));
}
