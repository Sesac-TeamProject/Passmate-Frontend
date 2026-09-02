import Link from "next/link";
import { StatusChip } from "@/components/common/status-chip";
import { Button } from "@/components/ui/button";
import type { ActiveSession } from "./types";

type Props = { session: ActiveSession };

/**
 * 아직 열려 있는 방 카드 — mint-bg · mint 테두리.
 *
 * **PIN이 응답에 없어** 카드에서 곧장 방으로 들어갈 수 없다(참여한 방 목록은 roomId만 준다).
 * 그래서 버튼은 PIN 입력 화면으로 보낸다 — "다시 들어가기"라 써 놓고 못 들어가는 것보다 낫다.
 */
export function ActiveSessionCard({ session }: Props) {
  return (
    <section className="flex items-center gap-4 rounded-2xl border border-mint bg-mint-bg px-6 py-5">
      <StatusChip tone="live" className="px-2.5 py-1">
        {session.isRunning ? "진행 중" : "대기 중"}
      </StatusChip>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h2 className="truncate text-heading-sm text-ink">{session.title}</h2>
        <p className="text-body-md text-muted-foreground">
          {session.hostName} 선생님 · 나갔다 와도 내 답은 그대로 남아 있어요 · PIN을 입력하면 다시
          들어갈 수 있어요
        </p>
      </div>
      <Button size="xl" className="h-11 px-5" nativeButton={false} render={<Link href="/join" />}>
        PIN으로 들어가기
      </Button>
    </section>
  );
}
