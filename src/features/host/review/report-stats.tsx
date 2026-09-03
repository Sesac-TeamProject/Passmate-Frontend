import type { SessionReport } from "@/features/host/types";
import { formatDuration } from "@/lib/format";

type Props = {
  stats: SessionReport["stats"];
  /** 정답률이 가장 낮은 문항. 없으면 그 칸을 "—"로 둔다 */
  lowest: { label: string; accuracyPercent: number } | null;
};

/** W-07 상단 KPI 6칸 — 평균 정답률·제출·완주율·평균 소요·서술형 채점·최저 문항 (시안 784:8863) */
export function ReportStats({ stats, lowest }: Props) {
  const submitted =
    stats.submittedCount === null ? "—" : `${stats.submittedCount} / ${stats.students}`;
  const completion = stats.completionPercent === null ? "—" : `${stats.completionPercent}%`;
  const avgElapsed =
    stats.avgElapsedSeconds === null ? "—" : formatDuration(stats.avgElapsedSeconds);
  const essay =
    stats.essayGradedCount === null || stats.essayTotalCount === null
      ? "—"
      : `${stats.essayGradedCount} / ${stats.essayTotalCount}`;

  return (
    <dl className="flex h-15 items-center rounded-lg border bg-card px-4">
      <Cell label="평균 정답률" value={`${stats.accuracy}%`} />
      <Cell label="제출" value={submitted} divided />
      <Cell label="완주율" value={completion} divided />
      <Cell label="평균 소요" value={avgElapsed} divided />
      <Cell label="서술형 채점" value={essay} divided />
      <Cell
        label="최저 문항"
        value={lowest === null ? "—" : `${lowest.label} · ${lowest.accuracyPercent}%`}
        divided
        alert
      />
    </dl>
  );
}

/** KPI 한 칸. divided면 왼쪽에 세로 구분선, alert면 값을 경고색으로 (시안 최저 문항) */
function Cell({
  label,
  value,
  divided,
  alert,
}: {
  label: string;
  value: string;
  divided?: boolean;
  alert?: boolean;
}) {
  return (
    <div
      className={
        divided
          ? "flex min-w-0 flex-1 flex-col gap-0.5 border-l border-line-soft pl-4"
          : "flex min-w-0 flex-1 flex-col gap-0.5"
      }
    >
      <dt className="text-label-md text-muted-foreground">{label}</dt>
      <dd
        className={
          alert
            ? "truncate text-heading-sm text-negative-soft-foreground"
            : "truncate text-heading-sm text-ink"
        }
      >
        {value}
      </dd>
    </div>
  );
}
