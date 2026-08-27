import Link from "next/link";
import type { PastSession } from "@/features/host/mock";
import { SectionHeader } from "./section-header";

type Props = {
  sessions: PastSession[];
  allHref: string;
  reportHref: (session: PastSession) => string;
};

export function RecentSessions({ sessions, allHref, reportHref }: Props) {
  return (
    <section className="flex flex-col gap-3">
      <SectionHeader title="지난 세션" href={allHref} />
      <ul className="rounded-[20px] border bg-card px-2 py-1">
        {sessions.map((s) => (
          <li key={s.id} className="flex items-center gap-4 border-b-2 px-4 py-3.5 last:border-b-0">
            <span className="flex h-10 w-[54px] shrink-0 items-center justify-center rounded-xl bg-muted text-label-lg text-mint-dark">
              {s.date}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-heading-sm text-ink">{s.title}</span>
              <span className="text-body-md text-muted-foreground">
                {s.participants}명 참여 · 평균 {s.averageScore}점
              </span>
            </div>
            <Link
              href={reportHref(s)}
              className="flex h-[38px] shrink-0 items-center rounded-xl bg-muted px-[18px] text-label-lg text-mint-dark transition-colors hover:bg-mint-tint"
            >
              리포트 보기
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
