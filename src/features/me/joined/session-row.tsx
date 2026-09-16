import Link from "next/link";
import type { AttendedSession } from "@/features/me/types";
import { cn } from "@/lib/utils";

/** 1·2·3위는 포디움 토큰, 그 외는 muted */
function rankClass(rank: number | null): string {
  switch (rank) {
    case 1:
      return "bg-podium-gold text-podium-gold-foreground";
    case 2:
      return "bg-podium-silver text-podium-silver-foreground";
    case 3:
      return "bg-podium-bronze text-podium-bronze-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

type Props = { session: AttendedSession };

/**
 * 참여한 세션 한 줄 (W-13 카드형) — 순위 원 · 제목/일시 · 점수 · 리포트.
 *
 * 폰 폭(768px 미만)은 앱 M-08 줄과 같이 제목 줄(순위 · 제목/일시) + 보조 줄(점수 · 리포트) 두 줄로 접는다.
 * `md:contents`로 그룹 div를 지워 md 이상에서는 원래 한 줄 flex 자식 4개(순위·제목열·점수·리포트)로
 * 그대로 돌아간다 — PC 마크업과 클래스는 손대지 않는다.
 */
export function SessionRow({ session }: Props) {
  return (
    <li className="flex items-center gap-4 rounded-[18px] border bg-card px-5 py-4 max-md:flex-col max-md:items-start max-md:gap-2.5">
      <div className="flex w-full items-center gap-4 md:contents">
        {/* 아직 안 끝난 방은 등수가 없다 — 0위로 채우지 않고 자리만 비운다 */}
        <span
          className={cn(
            "flex size-[30px] shrink-0 items-center justify-center rounded-full text-label-lg",
            rankClass(session.rank),
          )}
        >
          {session.rank === null ? "—" : `${session.rank}위`}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-heading-sm text-ink">{session.title}</span>
          <span className="text-body-md text-muted-foreground">
            {session.dateLabel} · {session.questionCount}문항
          </span>
        </div>
      </div>
      <div className="flex w-full items-center justify-between gap-4 md:contents">
        <span className="text-heading-sm text-ink">
          {session.score === null ? "진행 중" : `${session.score.toLocaleString()}점`}
        </span>
        {/* 리포트는 세션이 끝나야 만들어진다 — 없으면 링크를 걸지 않는다 */}
        {session.hasReport ? (
          <Link
            href={`/result/${session.id}`}
            className="flex h-[38px] shrink-0 items-center rounded-xl bg-muted px-4 text-label-lg text-mint-dark transition-colors hover:bg-mint-bg"
          >
            리포트
          </Link>
        ) : (
          <span className="flex h-[38px] shrink-0 items-center px-4 text-label-lg text-muted-foreground">
            리포트 준비 중
          </span>
        )}
      </div>
    </li>
  );
}
