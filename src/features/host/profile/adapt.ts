import type { PublicRoomDto } from "@/lib/types/dto";
import { formatDotDateWithDay } from "@/lib/format";
import type { HostRoom } from "./host-profile-page";

/** 공개 방 항목 → 프로필의 "운영 중인 방" 카드 */
export function toHostRooms(rooms: PublicRoomDto[]): HostRoom[] {
  return rooms.map((room) => ({
    pin: room.pin ?? "",
    title: room.title ?? "",
    isPaid: room.isPaid ?? false,
    entryFee: room.isPaid ? (room.entryFee ?? null) : null,
    meta: [
      room.scheduledAt ? formatDotDateWithDay(room.scheduledAt) : null,
      room.participantCount === null || room.participantCount === undefined
        ? null
        : `${room.participantCount}명 대기`,
    ]
      .filter(Boolean)
      .join(" · "),
  }));
}
