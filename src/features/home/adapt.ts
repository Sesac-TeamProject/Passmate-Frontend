import type { PublicRoomResponse } from "@/lib/types/dto";
import type { PopularRoom } from "./types";

/**
 * GET /rooms/public 항목 → 인기 방 카드.
 *
 * 응답에 **PIN이 없다** — 공개 목록으로는 구경만 하고, 입장하려면 PIN·QR을 받아야 한다.
 * 카드 식별에는 방 id를 쓴다. 호스트 등급도 서버가 아직 계산하지 않아 비운다.
 */
export function toPopularRooms(items: PublicRoomResponse[]): PopularRoom[] {
  return items.map((room) => ({
    code: String(room.id),
    topic: room.topic ?? "",
    type: room.type === "PAID" ? "paid" : "free",
    title: room.title,
    host: room.host.nickname,
    hostId: room.host.userId,
    level: null,
    participants: room.participantCount,
  }));
}
