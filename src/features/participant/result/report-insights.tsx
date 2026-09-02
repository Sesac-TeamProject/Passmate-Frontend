import { cn } from "@/lib/utils";

export type ReportComparison = {
  myPercent: number;
  classAveragePercent: number;
  topPercent: number;
};
export type ReportTrendPoint = { label: string; accuracyPercent: number };
export type ReportConcept = { name: string; correctCount: number; questionCount: number };

type Props = {
  /** @draft 계약 없음 — null이면 카드를 통째로 감춘다 */
  comparison: ReportComparison | null;
  trend: ReportTrendPoint[];
  concepts: ReportConcept[];
};

/** 리포트 분석 카드 3장 — 반 평균 비교 · 회차 추이 · 개념별 정답률 (시안 787:8862·8877·8890) */
export function ReportInsights({ comparison, trend, concepts }: Props) {
  const hasAny = comparison !== null || trend.length > 0 || concepts.length > 0;

  if (!hasAny) return null;

  return (
    <div className="grid grid-cols-3 gap-4">
      {comparison !== null && <ComparisonCard comparison={comparison} />}
      {trend.length > 0 && <TrendCard trend={trend} />}
      {concepts.length > 0 && <ConceptCard concepts={concepts} />}
    </div>
  );
}

function ComparisonCard({ comparison }: { comparison: ReportComparison }) {
  const gap = comparison.myPercent - comparison.classAveragePercent;
  const headline =
    gap > 0
      ? `나는 반 평균보다 ${gap}%p 높아요`
      : gap < 0
        ? `나는 반 평균보다 ${Math.abs(gap)}%p 낮아요`
        : "나는 반 평균과 같아요";

  return (
    <InsightCard title="반 평균과 비교" headline={headline} tone={gap < 0 ? "warn" : "good"}>
      <BarRow label="나" percent={comparison.myPercent} value={`${comparison.myPercent}%`} strong />
      <BarRow
        label="반 평균"
        percent={comparison.classAveragePercent}
        value={`${comparison.classAveragePercent}%`}
        fill="bg-mint-tint"
      />
      <BarRow
        label="1위"
        percent={comparison.topPercent}
        value={`${comparison.topPercent}%`}
        fill="bg-line-soft"
      />
    </InsightCard>
  );
}

function TrendCard({ trend }: { trend: ReportTrendPoint[] }) {
  const isRising = trend.every(
    (point, i) => i === 0 || point.accuracyPercent >= trend[i - 1].accuracyPercent,
  );
  const headline = `${trend.length}회 참여 · ${isRising ? "정답률이 계속 오르고 있어요" : "정답률이 오르내리고 있어요"}`;
  const peak = Math.max(...trend.map((point) => point.accuracyPercent), 1);

  return (
    <InsightCard title="이 방에서 나의 추이" headline={headline} tone={isRising ? "good" : "warn"}>
      <div className="flex flex-1 items-end justify-around border-b pt-2 pb-0">
        {trend.map((point, i) => (
          <div key={point.label} className="flex flex-col items-center gap-1">
            <span className="text-label-md text-ink">{point.accuracyPercent}%</span>
            <span
              className={cn(
                "w-19 rounded-[3px]",
                i === trend.length - 1 ? "bg-mint" : "bg-mint-tint",
              )}
              style={{ height: `${(point.accuracyPercent / peak) * 62}px` }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-around">
        {trend.map((point) => (
          <span key={point.label} className="text-label-md text-muted-foreground">
            {point.label}
          </span>
        ))}
      </div>
    </InsightCard>
  );
}

function ConceptCard({ concepts }: { concepts: ReportConcept[] }) {
  const weakest = [...concepts].sort((a, b) => ratioOf(a) - ratioOf(b))[0];

  return (
    <InsightCard title="개념별 정답률" headline={`${weakest.name}이 가장 약해요`} tone="warn">
      {concepts.map((concept) => (
        <BarRow
          key={concept.name}
          label={concept.name}
          percent={ratioOf(concept) * 100}
          value={`${concept.correctCount} / ${concept.questionCount}`}
          wideLabel
        />
      ))}
    </InsightCard>
  );
}

function ratioOf(concept: ReportConcept): number {
  return concept.questionCount === 0 ? 0 : concept.correctCount / concept.questionCount;
}

/** 정답률 띠 색 — 시안은 70 이상 민트 · 50 이상 앰버 · 그 아래 핑크로 나눈다 */
function fillFor(percent: number): string {
  if (percent >= 70) return "bg-mint";
  if (percent >= 50) return "bg-choice-c";
  return "bg-choice-a";
}

function InsightCard({
  title,
  headline,
  tone,
  children,
}: {
  title: string;
  headline: string;
  tone: "good" | "warn";
  children: React.ReactNode;
}) {
  return (
    <section className="flex h-[190px] flex-col gap-2 rounded-xl border bg-card px-[17px] py-[15px]">
      <h2 className="text-label-lg text-ink">{title}</h2>
      <p
        className={cn(
          "text-label-md",
          tone === "good" ? "text-mint-dark" : "text-negative-soft-foreground",
        )}
      >
        {headline}
      </p>
      <div className="flex flex-1 flex-col justify-center gap-3.5">{children}</div>
    </section>
  );
}

function BarRow({
  label,
  percent,
  value,
  fill,
  strong,
  wideLabel,
}: {
  label: string;
  percent: number;
  value: string;
  /** 지정하면 정답률 색 규칙 대신 이 색을 쓴다 (반 평균·1위 줄) */
  fill?: string;
  strong?: boolean;
  wideLabel?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={cn("shrink-0 truncate text-label-md text-ink", wideLabel ? "w-25" : "w-14")}>
        {label}
      </span>
      <span className="h-3 flex-1 overflow-hidden rounded-full bg-line-soft">
        <span
          className={cn("block h-full rounded-full", fill ?? fillFor(percent))}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </span>
      <span
        className={cn(
          "w-13 shrink-0 text-right text-label-md",
          strong ? "text-mint-dark" : "text-muted-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}
