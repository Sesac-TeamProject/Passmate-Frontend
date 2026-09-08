"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusChip } from "@/components/common/status-chip";
import { Button } from "@/components/ui/button";
import { useRejoinRoom } from "@/lib/queries/use-rooms";
import type { ActiveSession } from "./types";

type Props = { session: ActiveSession };

/**
 * 아직 열려 있는 방 카드 — mint-bg · mint 테두리.
 *
 * 목록이 PIN 을 주는 방은 재입장 API 로 **PIN 없이** 바로 돌아간다 — 나갔다 와도 점수·답안은
 * 원래 참가자 행에 그대로 남는다(시나리오 테스트 "핀 번호 없이 입장", 2026-09-08).
 * PIN 이 없는(옛 응답) 방만 PIN 입력 화면으로 보낸다.
 */
export function ActiveSessionCard({ session }: Props) {
  const router = useRouter();
  const rejoin = useRejoinRoom();

  const handleRejoin = () => {
    if (session.pin === null || rejoin.isPending) return;
    const pin = session.pin;
    rejoin.mutate(session.roomId, { onSuccess: () => router.push(`/play/${pin}`) });
  };

  return (
    <section className="flex items-center gap-4 rounded-2xl border border-mint bg-mint-bg px-6 py-5">
      <StatusChip tone="live" className="px-2.5 py-1">
        {session.isRunning ? "진행 중" : "대기 중"}
      </StatusChip>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h2 className="truncate text-heading-sm text-ink">{session.title}</h2>
        <p className="text-body-md text-muted-foreground">
          {rejoin.isError
            ? "지금은 다시 들어갈 수 없어요. 방이 끝났거나 내보내진 방이에요"
            : `${session.hostName} 선생님 · 나갔다 와도 내 답은 그대로 남아 있어요`}
        </p>
      </div>
      {session.pin === null ? (
        <Button size="xl" className="h-11 px-5" nativeButton={false} render={<Link href="/join" />}>
          PIN으로 들어가기
        </Button>
      ) : (
        <Button size="xl" className="h-11 px-5" onClick={handleRejoin} disabled={rejoin.isPending}>
          {rejoin.isPending ? "들어가는 중…" : "다시 들어가기"}
        </Button>
      )}
    </section>
  );
}
