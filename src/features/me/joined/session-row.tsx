import Link from "next/link";
import type { AttendedSession } from "@/features/me/mock";
import { cn } from "@/lib/utils";

/** 1·2·3위는 포디움 토큰, 그 외는 muted */
function rankClass(rank: number): string {
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

/** 참여한 세션 한 줄 (W-13 카드형) — 순위 원 · 제목/일시 · 점수 · 리포트 */
export function SessionRow({ session }: Props) {
  return (
    <li className="flex items-center gap-4 rounded-[18px] border bg-card px-5 py-4">
      <span
        className={cn(
          "flex size-[30px] shrink-0 items-center justify-center rounded-full text-label-lg",
          rankClass(session.rank),
        )}
      >
        {session.rank}위
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-heading-sm text-ink">{session.title}</span>
        <span className="text-body-md text-muted-foreground">
          {session.dateLabel} · {session.questionCount}문항
        </span>
      </div>
      <span className="text-heading-sm text-ink">{session.score.toLocaleString()}점</span>
      <Link
        href={`/result/${session.id}`}
        className="flex h-[38px] shrink-0 items-center rounded-xl bg-muted px-4 text-label-lg text-mint-dark transition-colors hover:bg-mint-bg"
      >
        리포트
      </Link>
    </li>
  );
}
