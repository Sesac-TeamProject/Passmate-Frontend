import Link from "next/link";
import { StatusChip } from "@/components/common/status-chip";
import { Button } from "@/components/ui/button";
import { formatPin } from "@/features/host/mock";
import type { ActiveSession } from "./mock";

type Props = { session: ActiveSession };

/** 진행 중인 방 재입장 카드 — mint-bg · mint 테두리 · "다시 들어가기" */
export function ActiveSessionCard({ session }: Props) {
  return (
    <section className="flex items-center gap-4 rounded-2xl border border-mint bg-mint-bg px-6 py-5">
      <StatusChip tone="live" className="px-2.5 py-1">
        진행 중
      </StatusChip>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h2 className="truncate text-heading-sm text-ink">{session.title}</h2>
        <p className="text-body-md text-muted-foreground">
          {session.progress.current} / {session.progress.total} 문항 진행 중 · {session.hostName}{" "}
          선생님 · PIN {formatPin(session.pin)} · 나갔다 와도 내 답은 그대로 남아 있어요
        </p>
      </div>
      <Button size="xl" className="h-11 px-5" render={<Link href={`/play/${session.code}`} />}>
        다시 들어가기
      </Button>
    </section>
  );
}
