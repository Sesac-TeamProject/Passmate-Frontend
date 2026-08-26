import Link from "next/link";
import { LEARNING_RECORD, MEMBER } from "@/features/student/mock";
import { cn } from "@/lib/utils";

const RANK_TONE = (rank: number) =>
  rank === 1
    ? "bg-podium-gold text-[#845f0f]"
    : rank === 2
      ? "bg-choice-b text-choice-b-foreground"
      : rank === 3
        ? "bg-[#f8c6a4] text-[#7a3a11]"
        : "bg-muted text-[#73727c]";

/** C-02 마이페이지 (학습 기록) — 회원 전용 */
export function LearningRecordPage() {
  const record = LEARNING_RECORD;
  const stats = [
    { label: "참여 세션", value: `${record.stats.sessions}회`, tile: "bg-muted text-mint-dark" },
    {
      label: "평균 정답률",
      value: `${record.stats.accuracy}%`,
      tile: "bg-[#deedff] text-[#0e61d9]",
    },
    {
      label: "평균 순위",
      value: `${record.stats.averageRank}위`,
      tile: "bg-[#fdefde] text-[#bf3f0c]",
    },
  ];

  return (
    <main className="flex flex-col gap-5 px-9 py-7">
      <h1 className="text-2xl font-black text-ink">{MEMBER.name} 님의 학습 기록</h1>

      <div className="grid grid-cols-3 gap-3.5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 rounded-[20px] border bg-card px-[18px] py-4"
          >
            <span
              aria-hidden
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-black",
                s.tile,
              )}
            >
              {s.value.charAt(0)}
            </span>
            <div className="flex flex-col gap-px">
              <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
              <span className="text-[22px] font-black text-ink">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[13px] font-black text-[#73727c]">보완할 주제</span>
        {record.weakTopics.map((t) => (
          <span
            key={t}
            className="rounded-full bg-[#fdefde] px-3 py-1.5 text-xs font-black text-[#bf3f0c]"
          >
            {t}
          </span>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-black text-ink">참여한 세션</h2>
        {record.sessions.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-4 rounded-[18px] border bg-card px-5 py-4"
          >
            <span
              className={cn(
                "flex size-[30px] shrink-0 items-center justify-center rounded-full text-[13px] font-black",
                RANK_TONE(s.rank),
              )}
            >
              {s.rank}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-[15px] font-bold text-ink">{s.title}</span>
              <span className="text-[13px] text-muted-foreground">
                {s.dateLabel} · {s.questionCount}문항
              </span>
            </div>
            <span className="text-[15px] font-black text-ink">{s.score.toLocaleString()}점</span>
            <Link
              href={`/result/${s.id}`}
              className="flex h-[38px] items-center rounded-xl bg-muted px-4 text-[13px] font-black text-mint-dark transition-colors hover:bg-mint-tint"
            >
              리포트
            </Link>
          </div>
        ))}
      </section>
    </main>
  );
}
