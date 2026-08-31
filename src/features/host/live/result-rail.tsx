import { clsx } from "clsx";
import { StudentAvatar } from "@/components/common/student-avatar";
import type { Student } from "@/features/host/types";
import { cn } from "@/lib/utils";
import { AccuracyMiniChart } from "./accuracy-mini-chart";

/** 레일에 노출하는 순위 행 — 시안은 TOP 5까지만 담는다 */
export type RankingRow = { rank: number; student: Student; score: number; change: number };

export const RANKING_LIMIT = 5;

/** 순위 변동. twMerge의 text-* 충돌을 피하려 clsx를 쓴다 */
function RankChange({ change }: { change: number }) {
  const label = change > 0 ? `▲${change}` : change < 0 ? `▼${Math.abs(change)}` : "—";
  return (
    <span
      className={clsx(
        "shrink-0 text-body-md font-bold",
        change > 0 ? "text-mint-dark" : change < 0 ? "text-muted-foreground" : "text-ink-disabled",
      )}
    >
      {label}
    </span>
  );
}

type Props = {
  rows: RankingRow[];
  /** 문항별 정답률(%). 아직 풀지 않은 문항은 null */
  accuracyByQuestion: (number | null)[];
  averageScore: number | null;
  totalStudents: number;
};

/** W-06 랭킹 레일 (펼침 300px) — TOP 5 + 문항별 정답률 미니 막대 + 평균 요약 */
export function ResultRail({ rows, accuracyByQuestion, averageScore, totalStudents }: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-[26px] pt-7 pb-[18px]">
        <p className="text-body-md text-muted-foreground">이번 문항까지</p>
        <p className="text-heading-md">랭킹 TOP {RANKING_LIMIT}</p>
      </div>

      {rows.length === 0 && (
        // 첫 문항이 끝나기 전에는 랭킹이 없다 — 비워 두면 레일 가운데가 크게 빈다
        <p className="border-t px-[26px] pt-5 text-body-md text-muted-foreground">
          채점이 끝나면 순위가 올라와요
        </p>
      )}

      <ol className={cn("flex flex-col gap-2.5 px-3.5 pt-2.5", rows.length > 0 && "border-t")}>
        {rows.map((row) => {
          const isFirst = row.rank === 1;
          return (
            <li
              key={row.student.id}
              className={cn(
                "flex h-[68px] items-center gap-3 rounded-2xl px-3",
                isFirst && "bg-mint-bg",
              )}
            >
              <span
                className={cn(
                  "w-4 shrink-0 text-heading-md",
                  isFirst ? "text-mint-dark" : "text-ink-disabled",
                )}
              >
                {row.rank}
              </span>
              <StudentAvatar
                avatar={row.student.avatar}
                size={36}
                className={cn(isFirst && "ring-2 ring-mint ring-offset-2 ring-offset-mint-bg")}
              />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-heading-md">{row.student.name}</span>
                <span className="text-body-md text-muted-foreground">{row.score}점</span>
              </span>
              <RankChange change={row.change} />
            </li>
          );
        })}
      </ol>

      <div className="mt-auto px-[26px] pb-8">
        <div className="border-t pt-6">
          <p className="text-label-md font-bold tracking-[0.08em] text-muted-foreground">
            문항별 정답률
          </p>
          <div className="mt-5">
            <AccuracyMiniChart values={accuracyByQuestion} />
          </div>
          <p className="mt-6 text-body-md text-muted-foreground">
            {averageScore !== null && `평균 ${averageScore}점 · `}전체 {totalStudents}명
          </p>
        </div>
      </div>
    </div>
  );
}

/** W-06 랭킹 레일 (접힘 72px) — 1위 라벨 + 순위 숫자를 붙인 아바타 스택 */
export function ResultRailMini({ rows }: { rows: RankingRow[] }) {
  return (
    <div className="flex h-full flex-col items-center pt-8">
      <p className="text-heading-md text-mint">1위</p>
      <div className="mt-4 h-px w-10 bg-border" />

      <ol className="mt-4 flex flex-col items-center gap-3">
        {rows.map((row) => (
          <li key={row.student.id} className="flex flex-col items-center gap-1">
            <StudentAvatar
              avatar={row.student.avatar}
              size={36}
              className={cn(
                row.rank === 1 && "ring-2 ring-mint ring-offset-2 ring-offset-surface-subtle",
              )}
            />
            <span className="text-label-md font-bold text-ink-disabled">{row.rank}</span>
          </li>
        ))}
      </ol>

      <p className="mt-5 text-label-md text-ink-disabled">랭킹</p>
    </div>
  );
}
