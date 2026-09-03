import type { ReportComparison } from "./report-insights";
import { formatDuration, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  /** 아직 채점 전이면 null */
  rank: number | null;
  score: number;
  correctCount: number;
  questionCount: number;
  /** @draft 계약 없음 — 없으면 "정답 n/m"만 적는다 */
  elapsedSeconds: number | null;
  /** @draft 계약 없음 — null이면 오른쪽 비교 막대를 통째로 감춘다 */
  comparison: ReportComparison | null;
};

/** 최종 결과 "내 결과" 카드 — 등수·점수 + 반 평균 비교 (시안 788:8914) */
export function MyResultCard({
  rank,
  score,
  correctCount,
  questionCount,
  elapsedSeconds,
  comparison,
}: Props) {
  const headline = rank === null ? "순위 집계 중" : `${rank}위 · ${formatNumber(score)}점`;
  const meta = [
    `정답 ${correctCount} / ${questionCount}`,
    elapsedSeconds === null ? null : `소요 ${formatDuration(elapsedSeconds)}`,
  ]
    .filter((part): part is string => part !== null)
    .join(" · ");

  return (
    <section className="flex gap-10 rounded-2xl bg-mint-bg px-5 py-4">
      <div className="flex w-75 shrink-0 flex-col gap-1">
        <h2 className="text-label-md text-mint-dark">내 결과</h2>
        <p className="text-heading-lg text-ink">{headline}</p>
        <p className="text-label-md text-muted-foreground">{meta}</p>
      </div>

      {comparison !== null && <Comparison comparison={comparison} />}
    </section>
  );
}

function Comparison({ comparison }: { comparison: ReportComparison }) {
  const gap = comparison.myPercent - comparison.classAveragePercent;
  const note =
    gap > 0
      ? `반 평균보다 ${gap}%p 높아요`
      : gap < 0
        ? `반 평균보다 ${Math.abs(gap)}%p 낮아요`
        : "반 평균과 같아요";

  return (
    <div className="flex min-w-0 flex-1 flex-col justify-center gap-2.5">
      <Bar label="나" percent={comparison.myPercent} strong />
      <Bar label="반 평균" percent={comparison.classAveragePercent} />
      <p className={cn("text-label-md", gap < 0 ? "text-muted-foreground" : "text-mint-dark")}>
        {note}
      </p>
    </div>
  );
}

function Bar({ label, percent, strong }: { label: string; percent: number; strong?: boolean }) {
  return (
    <p className="flex items-center gap-4">
      <span className="w-15 shrink-0 text-label-md text-ink">{label}</span>
      <span className="h-3 flex-1 overflow-hidden rounded-full bg-card">
        <span
          className={cn("block h-full rounded-full", strong ? "bg-mint" : "bg-mint-tint")}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </span>
      <span
        className={cn(
          "w-16 shrink-0 text-right text-label-lg",
          strong ? "text-mint-dark" : "text-muted-foreground",
        )}
      >
        {percent}%
      </span>
    </p>
  );
}
