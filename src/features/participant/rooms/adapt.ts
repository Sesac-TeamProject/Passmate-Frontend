import { parseServerDateTime } from "@/lib/datetime";
import type { PublicRoomResponse } from "@/lib/types/dto";
import type { PublicRoomItem, PublicRoomTiming } from "./types";

/**
 * scheduledAt → 카드 오른쪽 문구.
 * 시안이 "20:00 시작" · "내일 19:00" 두 가지를 쓰므로 오늘/내일/그 밖으로 나눈다.
 */
export function toTiming(
  status: PublicRoomResponse["status"],
  scheduledAt: string | undefined,
): PublicRoomTiming {
  if (status === "RUNNING") return { kind: "live" };
  if (!scheduledAt) return { kind: "unknown" };

  const at = parseServerDateTime(scheduledAt);
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
 * 응답에 **PIN이 없다** — 목록에서 바로 입장할 수 없고, 학생은 PIN·QR을 받아야 한다.
 * 카드 식별에는 방 id를 쓴다.
 *
 * "인기" 배지는 그리지 않는다 — 해당 필드가 없고, `sort=POPULAR`의 앞자리로 흉내 내면
 * 필터를 바꿀 때마다 배지가 뒤집힌다.
 */
export function toPublicRoomItems(items: PublicRoomResponse[]): PublicRoomItem[] {
  return items.map((room) => ({
    code: String(room.id),
    title: room.title,
    topic: room.topic ?? "",
    type: room.type === "PAID" ? "paid" : "free",
    entryFee: room.type === "PAID" ? (room.fee ?? null) : null,
    questionCount: room.questionCount ?? null,
    host: room.host.nickname,
    hostId: room.host.userId,
    participants: room.participantCount,
    timing: toTiming(room.status, room.scheduledAt),
  }));
}
