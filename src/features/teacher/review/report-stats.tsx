import type { SessionReport } from "@/features/teacher/mock";

type Props = { stats: SessionReport["stats"] };

const TILE = {
  accuracy: "bg-[#e2f4ea] text-[#26774d]",
  students: "bg-[#deedff] text-[#0e61d9]",
  questions: "bg-[#fdefde] text-[#bf3f0c]",
  aiAnalyses: "bg-muted text-mint-dark",
} as const;

/** W-07 상단 통계 4장 (정답률·학생·문항·AI 분석) */
export function ReportStats({ stats }: Props) {
  const items = [
    { key: "accuracy", label: "평균 정답률", value: `${stats.accuracy}%` },
    { key: "students", label: "학생", value: `${stats.students}명` },
    { key: "questions", label: "문항", value: `${stats.questions}개` },
    { key: "aiAnalyses", label: "AI 분석", value: `${stats.aiAnalyses}건` },
  ] as const;

  return (
    <div className="grid grid-cols-4 gap-3.5">
      {items.map((it) => (
        <div
          key={it.key}
          className="flex items-center gap-3 rounded-[18px] border bg-card px-4 py-3.5"
        >
          <span
            aria-hidden
            className={`flex size-[38px] shrink-0 items-center justify-center rounded-xl text-sm font-black ${TILE[it.key]}`}
          >
            {it.value.charAt(0)}
          </span>
          <div className="flex flex-col gap-px">
            <span className="text-[11px] font-medium text-muted-foreground">{it.label}</span>
            <span className="text-[19px] font-black text-ink">{it.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
