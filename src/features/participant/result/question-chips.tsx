import type { ReportRow, ReportVerdict } from "./report-question-table";
import { cn } from "@/lib/utils";

/** 칩 색 — 리포트 표의 결과 칩과 같은 말·같은 색을 쓴다 */
const VERDICT = {
  CORRECT: { label: "정답", cls: "bg-mint-bg text-mint-dark" },
  WRONG: { label: "오답", cls: "bg-negative-bg text-negative-soft-foreground" },
  PARTIAL: { label: "부분", cls: "bg-yellow-soft text-choice-c-foreground" },
  PENDING: { label: "분석 중", cls: "bg-muted text-muted-foreground" },
  UNKNOWN: { label: "미채점", cls: "bg-muted text-muted-foreground" },
} as const satisfies Record<ReportVerdict, { label: string; cls: string }>;

type Props = {
  rows: ReportRow[];
  /** 칩을 누르면 문항 상세로. 없으면 누를 수 없다 */
  onOpenQuestion?: (no: number) => void;
};

/** 최종 결과 "문항별 내 결과" — Q1~Q8 칩 (시안 788:8927) */
export function QuestionChips({ rows, onOpenQuestion }: Props) {
  if (rows.length === 0) return null;

  return (
    <section className="flex flex-col gap-3 rounded-2xl border bg-card px-[18px] py-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-label-lg text-ink">문항별 내 결과</h2>
        <p className="text-label-md text-muted-foreground">자세한 해설은 내 리포트에서</p>
      </div>

      <ul className="flex flex-wrap gap-[9px]">
        {rows.map((row) => {
          const verdict = VERDICT[row.verdict];

          return (
            <li key={row.questionId}>
              <button
                type="button"
                disabled={onOpenQuestion === undefined}
                onClick={() => onOpenQuestion?.(row.no)}
                className={cn(
                  "flex h-[58px] w-21 flex-col items-center justify-center gap-0.5 rounded-xl transition-opacity",
                  verdict.cls,
                  onOpenQuestion !== undefined && "hover:opacity-80",
                )}
              >
                <span className="text-label-md">Q{row.no}</span>
                <span className="text-label-lg">{verdict.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
