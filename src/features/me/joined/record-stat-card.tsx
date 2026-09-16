import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type RecordStatTone = "mint" | "blue" | "orange";

const TONE_CLASS: Record<RecordStatTone, string> = {
  mint: "bg-muted text-mint-dark",
  blue: "bg-blue-soft text-blue",
  orange: "bg-orange-soft text-orange",
};

type Props = {
  icon: LucideIcon;
  tone: RecordStatTone;
  label: string;
  value: string;
};

/**
 * 참여 기록 통계 카드 (W-13) — 40px 아이콘 타일 + label-lg 라벨 + heading-lg 값, r20 카드.
 * 공용 InitialTile은 44px·r14라 여기서 직접 그린다. 시안 타일 안 글자는 값 첫 자리(자리표시자)라 아이콘으로 대체.
 */
export function RecordStatCard({ icon: Icon, tone, label, value }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-[20px] border bg-card px-[18px] py-4">
      <span
        aria-hidden
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl text-label-lg",
          TONE_CLASS[tone],
        )}
      >
        <Icon className="size-5" strokeWidth={2} />
      </span>
      <div className="flex flex-col gap-1">
        <span className="text-label-lg text-muted-foreground">{label}</span>
        <span className="text-heading-lg text-ink">{value}</span>
      </div>
    </div>
  );
}

type SummaryProps = {
  /** 0~100 */
  accuracyPercent: number;
  sessions: number;
  averageRank: number;
  /** "지난주보다 4.2%p 올랐어요" — 누적 리포트가 없으면 숨긴다 */
  trendLabel?: string | null;
};

/**
 * 참여 기록 요약 카드 (폰 폭, 앱 M-08 `SummaryCard`) — PC의 통계 3칸 격자를 대신한다.
 * 지름 70 · 테두리 6 민트의 정답률 링 + "N회 참여 · 평균 N위" 줄 + 추이 줄(있을 때만).
 * 링은 새로 설계하지 않고 report-summary-card.tsx의 CorrectRing과 같은 SVG strokeDasharray 방식을 따른다.
 */
export function JoinedSummaryCard({
  accuracyPercent,
  sessions,
  averageRank,
  trendLabel = null,
}: SummaryProps) {
  const RADIUS = 32;
  const STROKE = 6;
  const circumference = 2 * Math.PI * RADIUS;
  const ratio = Math.min(Math.max(accuracyPercent, 0), 100) / 100;

  return (
    <section className="flex items-center gap-4 rounded-[20px] border bg-card px-[18px] py-4 md:hidden">
      <div className="relative size-[70px] shrink-0">
        <svg viewBox="0 0 70 70" className="size-full -rotate-90" aria-hidden>
          <circle
            cx="35"
            cy="35"
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            className="stroke-line-soft"
          />
          <circle
            cx="35"
            cy="35"
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${circumference * ratio} ${circumference}`}
            className="stroke-mint"
          />
        </svg>
        <span className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-label-lg text-mint-dark">{accuracyPercent}%</span>
          <span className="text-label-md text-muted-foreground">평균</span>
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-label-lg text-ink">
          {sessions}회 참여 · 평균 {averageRank}위
        </span>
        {trendLabel !== null && (
          <span className="text-label-md text-muted-foreground">{trendLabel}</span>
        )}
      </div>
    </section>
  );
}
