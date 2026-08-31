import type { PublicRoomDto } from "@/lib/types/dto";
import type { PopularRoom } from "./types";

/** GET /rooms/public 항목 → 인기 방 카드 */
export function toPopularRooms(items: PublicRoomDto[]): PopularRoom[] {
  return items.map((room) => ({
    code: room.pin ?? "",
    topic: room.topic ?? "",
    type: room.isPaid ? "paid" : "free",
    title: room.title ?? "",
    host: room.hostName ?? "",
    hostId: room.hostId ?? null,
    level: room.hostLevel ?? 1,
    participants: room.participantCount ?? 0,
  }));
}
