import { AccuracyMiniChart, AccuracyMiniRows } from "./accuracy-mini-chart";

export type SessionSummary = {
  /** 평균 정답률(%) */
  avgAccuracy: number | null;
  /** 끝까지 참여한 학생 수 */
  studentCount: number;
  /** 진행 시간(분). 계약에 없어 지금은 늘 null (DESIGN_GAPS D-16) */
  minutes: number | null;
  questionCount: number;
};

/** 정답률이 가장 낮은 문항 — 레일 하단 경고 패널 */
export type HardestQuestion = { no: number; accuracy: number; title: string };

type Props = {
  summary: SessionSummary;
  /** 문항별 정답률(%). 아직 채점되지 않은 문항은 null */
  accuracyByQuestion: (number | null)[];
  hardest: HardestQuestion | null;
};

/** W-12 세션 요약 레일 (펼침 300px) */
export function FinalRail({ summary, accuracyByQuestion, hardest }: Props) {
  const stats = [
    {
      value: summary.avgAccuracy === null ? "—" : `${summary.avgAccuracy}%`,
      label: "평균 정답률",
      accent: true,
    },
    { value: `${summary.studentCount}명`, label: "끝까지 참여" },
    { value: summary.minutes === null ? "—" : `${summary.minutes}분`, label: "진행 시간" },
    { value: `${summary.questionCount}개`, label: "문항 수" },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="px-[26px] pt-7 pb-[18px]">
        <p className="text-body-md text-muted-foreground">오늘 세션</p>
        <p className="text-heading-md">요약</p>
      </div>

      <ul className="border-t px-[26px]">
        {stats.map((s, i) => (
          <li
            key={s.label}
            className={
              i > 0
                ? "flex flex-col gap-1 border-t border-line-soft py-3"
                : "flex flex-col gap-1 py-3"
            }
          >
            <span className={s.accent ? "text-display-md text-mint" : "text-display-md"}>
              {s.value}
            </span>
            <span className="text-body-md text-muted-foreground">{s.label}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto px-[26px] pb-6">
        <div className="border-t pt-6">
          <p className="text-label-md font-bold tracking-[0.08em] text-muted-foreground">
            문항별 정답률
          </p>
          <div className="mt-5">
            <AccuracyMiniChart values={accuracyByQuestion} maxHeight={68} />
          </div>
        </div>

        {hardest && (
          <div className="mt-6 flex flex-col gap-2 rounded-2xl bg-negative-bg p-4 text-negative-soft-foreground">
            <span className="text-label-md font-bold tracking-[0.08em]">가장 어려웠던 문항</span>
            <span className="text-heading-md">
              {hardest.no}번 · 정답률 {hardest.accuracy}%
            </span>
            <span className="truncate text-body-md">{hardest.title}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** W-12 세션 요약 레일 (접힘 72px) — 평균 정답률 + 문항별 가로 막대 */
export function FinalRailMini({
  summary,
  accuracyByQuestion,
}: Pick<Props, "summary" | "accuracyByQuestion">) {
  return (
    <div className="flex h-full flex-col items-center pt-8">
      <p className="text-heading-md text-mint">
        {summary.avgAccuracy === null ? "—" : `${summary.avgAccuracy}%`}
      </p>
      <p className="text-label-md text-muted-foreground">평균</p>
      <div className="mt-5 h-px w-10 bg-border" />

      <div className="mt-5">
        <AccuracyMiniRows values={accuracyByQuestion} />
      </div>

      <p className="mt-6 text-label-md text-ink-disabled">정답률</p>
    </div>
  );
}
