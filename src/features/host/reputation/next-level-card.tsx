export type LevelCriterion = {
  label: string;
  current: number;
  target: number;
  /** 값 뒤에 붙는 단위. 예: "회", "명" */
  unit: string;
};

type Props = {
  targetLevel: number;
  targetTitle: string;
  criteria: LevelCriterion[];
  /** 유지 조건 안내 한 줄. 없으면 감춘다 */
  note: string | null;
};

/** W-14 "Lv.N까지" — 남은 승급 조건을 진행 바로 보여 준다 (시안 813:8870) */
export function NextLevelCard({ targetLevel, targetTitle, criteria, note }: Props) {
  if (criteria.length === 0) return null;

  return (
    <section className="flex flex-col gap-4 rounded-2xl border bg-card px-6 py-4">
      <h2 className="text-label-lg text-ink">
        Lv.{targetLevel} {targetTitle}까지
      </h2>

      <div className="grid grid-cols-2 gap-10">
        {criteria.map((criterion) => (
          <div key={criterion.label} className="flex flex-col gap-2.5">
            <p className="flex items-baseline justify-between gap-3">
              <span className="text-label-md text-muted-foreground">{criterion.label}</span>
              <span className="text-label-md text-ink">
                {criterion.current}
                {criterion.unit} → {criterion.target}
                {criterion.unit}
              </span>
            </p>
            <span className="h-2 w-full overflow-hidden rounded-full bg-line-soft">
              <span
                className="block h-full rounded-full bg-mint"
                style={{ width: `${ratio(criterion)}%` }}
              />
            </span>
          </div>
        ))}
      </div>

      {note !== null && <p className="text-label-md text-muted-foreground">{note}</p>}
    </section>
  );
}

function ratio(criterion: LevelCriterion): number {
  if (criterion.target <= 0) return 100;
  return Math.min(100, Math.round((criterion.current / criterion.target) * 100));
}
