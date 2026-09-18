import Link from "next/link";
import { PAID_ROOM_MIN_LEVEL } from "@/features/host/room-flow/adapt";

type Props = { currentLevel: number };

/**
 * M-09 하단 CTA (349:9834) — 유료 방 개설로 가는 자리.
 * 시안은 잠김 상태만 그리지만, 이미 자격이 있는 선생님에게 죽은 회색 칸을 보일 이유가 없어
 * Lv.3 이상이면 방 만들기로 가는 민트 버튼으로 바꾼다(2026-09-18 결정). **폰 전용.**
 */
export function PaidRoomCta({ currentLevel }: Props) {
  if (currentLevel < PAID_ROOM_MIN_LEVEL) {
    return (
      <p className="flex h-13 items-center justify-center rounded-2xl bg-muted text-label-lg text-ink-disabled md:hidden">
        🔒 유료 방 만들기 — Lv.{PAID_ROOM_MIN_LEVEL}부터
      </p>
    );
  }

  return (
    <Link
      href="/host/rooms/new"
      className="flex h-13 items-center justify-center rounded-2xl bg-mint text-label-lg text-white hover:bg-mint-dark md:hidden"
    >
      유료 방 만들기
    </Link>
  );
}
