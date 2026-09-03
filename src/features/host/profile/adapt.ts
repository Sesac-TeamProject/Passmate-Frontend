import type { PublicRoomResponse } from "@/lib/types/dto";
import { formatDotDateWithDay } from "@/lib/format";
import type { HostRoom } from "./host-profile-page";

/**
 * 공개 프로필의 `openRooms` → "운영 중인 방" 카드.
 * 공개 방 카드에는 **PIN이 없다**(DESIGN_GAPS N-1) — 카드에서 방으로 바로 넣지 못한다.
 */
export function toHostRooms(rooms: PublicRoomResponse[]): HostRoom[] {
  return rooms.map((room) => ({
    roomId: room.id,
    title: room.title,
    isPaid: room.type !== "FREE",
    entryFee: room.type === "FREE" ? null : (room.fee ?? null),
    meta: [
      room.scheduledAt ? formatDotDateWithDay(room.scheduledAt) : null,
      room.questionCount === undefined ? null : `${room.questionCount}문항`,
      `${room.participantCount}명 참여 중`,
    ]
      .filter((part): part is string => part !== null)
      .join(" · "),
  }));
}
