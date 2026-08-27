import { DoorOpen } from "lucide-react";
import Link from "next/link";
import { AVATAR_LABEL, StudentAvatar } from "@/components/common/student-avatar";
import type { LearningRecord, Profile } from "@/features/me/mock";
import { StatTile } from "@/features/me/stat-tile";

type Props = { profile: Profile; learning: LearningRecord };

/** 참여한 방 — client로서의 학습 기록·최근 참여·캐릭터 */
export function GuestCard({ profile, learning }: Props) {
  return (
    <section className="flex min-w-0 flex-1 flex-col gap-3.5 rounded-2xl border bg-card p-5">
      <header className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-heading-sm text-ink">
          <DoorOpen aria-hidden className="size-5 text-mint" strokeWidth={2} />
          참여한 방
        </h2>
        {/* TODO(API): 참여 기록 전체 목록 화면 — 디자인 미정 */}
        <Link href="#" className="text-label-md text-mint-dark">
          참여 기록 더보기 ›
        </Link>
      </header>

      <div className="flex gap-3">
        <StatTile label="참여 세션" value={`${learning.stats.sessions}회`} />
        <StatTile label="평균 정답률" value={`${learning.stats.accuracy}%`} />
        <StatTile label="평균 순위" value={`${learning.stats.averageRank}위`} />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-label-md text-muted-foreground">보완할 주제</span>
        {learning.weakTopics.map((t) => (
          <span
            key={t}
            className="rounded-full bg-mint-bg px-3 py-[5px] text-label-md text-mint-dark"
          >
            {t}
          </span>
        ))}
      </div>

      <span className="text-label-md text-muted-foreground">최근 참여</span>
      {learning.sessions.map((s) => (
        <div key={s.id} className="flex items-center gap-3 rounded-xl bg-muted px-3 py-2.5">
          <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-card text-label-lg text-ink">
            {s.rank}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-label-lg text-ink">{s.title}</span>
            <span className="text-label-md text-muted-foreground">
              {s.dateLabel} · {s.questionCount}문항
            </span>
          </div>
          <span className="text-label-lg text-ink">{s.score.toLocaleString()}점</span>
          <Link
            href={`/result/${s.id}`}
            className="rounded-lg border bg-card px-3 py-1.5 text-label-md text-mint-dark transition-colors hover:bg-mint-bg"
          >
            리포트
          </Link>
        </div>
      ))}

      <div className="h-px bg-border" />

      {/* TODO(API): 캐릭터 선택 화면 — 디자인 미정 */}
      <Link href="#" className="flex items-center justify-between">
        <span className="text-label-lg text-ink">내 캐릭터 바꾸기</span>
        <span className="flex items-center gap-1.5 text-label-md text-ink-disabled">
          <StudentAvatar avatar={profile.avatar} size={24} />
          {AVATAR_LABEL[profile.avatar]} ›
        </span>
      </Link>
    </section>
  );
}
