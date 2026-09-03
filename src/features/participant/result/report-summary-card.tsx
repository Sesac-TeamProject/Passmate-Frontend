import { formatDuration, formatNumber } from "@/lib/format";

type Props = {
  roomTitle: string;
  /** "8/22 (금) · 3회차 참여 · 문항 8개" — 조각이 없으면 컨테이너가 있는 것만 이어 붙인다 */
  subtitle: string;
  correctCount: number;
  questionCount: number;
  /** 순위·총원 중 하나라도 없으면 "집계 중"으로 적는다 */
  rank: number | null;
  participantCount: number | null;
  accuracyPercent: number;
  /** @draft 계약 없음 — 없으면 칸을 "—"로 둔다 */
  elapsedSeconds: number | null;
  score: number;
  onSavePdf: () => void;
};

/** 리포트 머리 카드 — 정답 링 · 방 제목 · KPI 4칸 · PDF 저장 (시안 P-Web 내 리포트 787:8843) */
export function ReportSummaryCard({
  roomTitle,
  subtitle,
  correctCount,
  questionCount,
  rank,
  participantCount,
  accuracyPercent,
  elapsedSeconds,
  score,
  onSavePdf,
}: Props) {
  const rankText =
    rank === null || participantCount === null ? "집계 중" : `${rank}위 / ${participantCount}명`;
  const elapsedText = elapsedSeconds === null ? "—" : formatDuration(elapsedSeconds);

  return (
    <section className="flex items-center gap-[18px] rounded-xl border bg-card px-[21px] py-[17px]">
      <CorrectRing correctCount={correctCount} questionCount={questionCount} />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h1 className="truncate text-heading-md text-ink">{roomTitle}</h1>
        <p className="truncate text-label-md text-muted-foreground">{subtitle}</p>
      </div>

      <dl className="flex shrink-0 items-center">
        <Kpi label="순위" value={rankText} />
        <Kpi label="정답률" value={`${accuracyPercent}%`} divided />
        <Kpi label="소요 시간" value={elapsedText} divided />
        <Kpi label="획득 점수" value={`${formatNumber(score)}점`} divided />
      </dl>

      <button
        type="button"
        onClick={onSavePdf}
        className="h-11 w-25 shrink-0 rounded-lg border bg-card text-label-md text-ink transition-colors hover:bg-muted"
      >
        PDF 저장
      </button>
    </section>
  );
}

/** 정답 개수 링. 값은 서버가 준 correct/total을 그대로 그린다 (클라이언트 재계산 아님) */
function CorrectRing({
  correctCount,
  questionCount,
}: {
  correctCount: number;
  questionCount: number;
}) {
  const RADIUS = 26;
  const circumference = 2 * Math.PI * RADIUS;
  const ratio = questionCount === 0 ? 0 : correctCount / questionCount;

  return (
    <div className="relative size-15 shrink-0">
      <svg viewBox="0 0 60 60" className="size-full -rotate-90" aria-hidden>
        <circle
          cx="30"
          cy="30"
          r={RADIUS}
          fill="none"
          strokeWidth="5"
          className="stroke-line-soft"
        />
        <circle
          cx="30"
          cy="30"
          r={RADIUS}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${circumference * ratio} ${circumference}`}
          className="stroke-mint"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-label-lg text-mint-dark">
        {correctCount}/{questionCount}
      </span>
    </div>
  );
}

/** KPI 한 칸. divided면 왼쪽에 세로 구분선을 둔다 (시안 787:8853) */
function Kpi({ label, value, divided }: { label: string; value: string; divided?: boolean }) {
  return (
    <div
      className={
        divided
          ? "flex w-[150px] flex-col gap-1 border-l border-line-soft pl-[18px]"
          : "flex w-[132px] flex-col gap-1"
      }
    >
      <dt className="text-label-md text-muted-foreground">{label}</dt>
      <dd className="truncate text-heading-sm text-ink">{value}</dd>
    </div>
  );
}
