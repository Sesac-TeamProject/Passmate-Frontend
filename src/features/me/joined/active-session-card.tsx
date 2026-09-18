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
 *
 * 폰 폭(768px 미만)은 앱 M-08 `OngoingCard`처럼 상태·제목 줄 아래 버튼을 꽉 채운 줄로 내려
 * "다시 들어가기" 글자가 잘리지 않게 한다. `md:contents`로 md 이상에서는 원래 한 줄(상태 칩·
 * 제목열·버튼 3개 flex 자식)로 그대로 돌아간다.
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
    <section className="flex items-center gap-4 rounded-2xl border border-mint bg-mint-bg px-6 py-5 max-md:flex-col max-md:items-stretch max-md:gap-3 max-md:px-4 max-md:py-4">
      <div className="flex min-w-0 flex-1 items-center gap-4 md:contents">
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
      </div>
      {session.pin === null ? (
        <Button
          size="xl"
          className="h-11 px-5 max-md:w-full"
          nativeButton={false}
          render={<Link href="/join" />}
        >
          PIN으로 들어가기
        </Button>
      ) : (
        <Button
          size="xl"
          className="h-11 px-5 max-md:w-full"
          onClick={handleRejoin}
          disabled={rejoin.isPending}
        >
          {rejoin.isPending ? "들어가는 중…" : "다시 들어가기"}
        </Button>
      )}
    </section>
  );
}
