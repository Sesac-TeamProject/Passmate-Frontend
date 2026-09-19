import type { SessionReport } from "@/features/host/types";
import { formatDuration } from "@/lib/format";
import { accuracyFill } from "./accuracy-tone";

type Props = {
  stats: SessionReport["stats"];
  /** 정답률이 가장 낮은 문항. 없으면 그 칸을 "—"로 둔다 */
  lowest: { label: string; accuracyPercent: number } | null;
};

/**
 * W-07 상단 요약 — 평균 정답률 하나를 크게 세우고 나머지 다섯은 곁들인다.
 *
 * 여섯 칸을 같은 크기로 늘어놓으면 무엇부터 볼지 정해지지 않는다. 선생님이 첫 눈에 재는 건
 * "이 방이 잘 풀렸나"라서 평균 정답률만 큰 숫자 + 막대로 두고, 나머지는 세로선으로만 나눈다.
 */
export function ReportStats({ stats, lowest }: Props) {
  const submitted =
    stats.submittedCount === null ? "—" : `${stats.submittedCount} / ${stats.students}명`;
  const completion = stats.completionPercent === null ? "—" : `${stats.completionPercent}%`;
  const avgElapsed =
    stats.avgElapsedSeconds === null ? "—" : formatDuration(stats.avgElapsedSeconds);
  const essay =
    stats.essayGradedCount === null || stats.essayTotalCount === null
      ? "—"
      : `${stats.essayGradedCount} / ${stats.essayTotalCount}`;
  // 채점이 남아 있으면 그 칸도 눈에 띄어야 한다 — 최저 문항과 같은 경고색을 쓴다
  const essayPending =
    stats.essayGradedCount !== null &&
    stats.essayTotalCount !== null &&
    stats.essayGradedCount < stats.essayTotalCount;

  return (
    <dl className="flex items-start border-b pb-4">
      <div className="flex w-56 shrink-0 flex-col gap-1 pr-6">
        <dt className="text-label-md text-muted-foreground">평균 정답률</dt>
        <dd className="text-display-sm text-ink">{stats.accuracy}%</dd>
        <dd aria-hidden className="mt-1 h-1.5 w-50 overflow-hidden rounded-full bg-line-soft">
          <span
            className={`block h-full rounded-full ${accuracyFill(stats.accuracy)}`}
            style={{ width: `${stats.accuracy}%` }}
          />
        </dd>
      </div>

      <Cell label="제출" value={submitted} />
      <Cell label="완주율" value={completion} />
      <Cell label="평균 소요" value={avgElapsed} />
      <Cell label="서술형 채점" value={essay} alert={essayPending} />
      <Cell
        label="가장 어려운 문항"
        value={lowest === null ? "—" : `${lowest.label} · ${lowest.accuracyPercent}%`}
        alert={lowest !== null}
      />
    </dl>
  );
}

/** 요약 한 칸. 왼쪽에 세로 구분선, alert면 값을 경고색으로 (시안 가장 어려운 문항·채점 잔여) */
function Cell({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5 border-l border-line-soft py-1 pl-5">
      <dt className="text-label-md text-muted-foreground">{label}</dt>
      <dd
        className={
          alert
            ? "truncate text-heading-sm text-warning-strong"
            : "truncate text-heading-sm text-ink"
        }
      >
        {value}
      </dd>
    </div>
  );
}
