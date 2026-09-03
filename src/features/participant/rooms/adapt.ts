import type { PublicRoomDto } from "@/lib/types/dto";
import type { PublicRoomItem, PublicRoomTiming } from "./types";

/**
 * scheduledAt → 카드 오른쪽 문구.
 * 시안이 "20:00 시작" · "내일 19:00" 두 가지를 쓰므로 오늘/내일/그 밖으로 나눈다.
 */
export function toTiming(
  status: PublicRoomDto["status"],
  scheduledAt: string | null | undefined,
): PublicRoomTiming {
  if (status === "RUNNING") return { kind: "live" };
  if (!scheduledAt) return { kind: "unknown" };

  const at = new Date(scheduledAt);
  if (Number.isNaN(at.getTime())) return { kind: "unknown" };

  const hh = String(at.getHours()).padStart(2, "0");
  const mm = String(at.getMinutes()).padStart(2, "0");
  const time = `${hh}:${mm}`;

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(at) - startOfDay(new Date())) / 86_400_000);

  if (dayDiff === 0) return { kind: "scheduled", label: `${time} 시작` };
  if (dayDiff === 1) return { kind: "scheduled", label: `내일 ${time}` };

  const md = `${at.getMonth() + 1}/${at.getDate()}`;
  return { kind: "scheduled", label: `${md} ${time}` };
}

/**
 * GET /rooms/public 항목 → 공개 방 목록 카드.
 *
 * 시안 카드에 있는데 계약이 안 주는 것 둘은 그리지 않는다 (지어내지 않는다):
 * - "8문항" — PublicRoomDto에 questionCount가 없다 (PublicRoom에는 있는데 목록 응답에는 빠져 있다)
 * - "인기" 배지 — 해당 필드가 없다. sort=popular의 앞자리로 흉내 내면 필터를 바꿀 때마다 뒤집힌다
 */
export function toPublicRoomItems(items: PublicRoomDto[]): PublicRoomItem[] {
  return items.map((room) => ({
    code: room.pin ?? "",
    title: room.title ?? "",
    topic: room.topic ?? "",
    type: room.isPaid ? "paid" : "free",
    entryFee: room.isPaid ? (room.entryFee ?? null) : null,
    host: room.hostName ?? "",
    hostId: room.hostId ?? null,
    participants: room.participantCount ?? 0,
    timing: toTiming(room.status, room.scheduledAt),
  }));
}
