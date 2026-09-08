import { StudentAvatar } from "@/components/common/student-avatar";
import type { Student } from "@/features/host/types";

/** 4위부터의 순위 행 */
export type FinalRankRow = {
  rank: number;
  student: Student;
  score: number;
  /** 맞힌 문항 수. 낸 답이 없으면 null — "—"로 그린다 */
  correctCount: number | null;
};

/** 4위부터는 2열로 나눠 담는다 (시안 4~8 / 9~12) */
function splitColumns<T>(rows: T[]): [T[], T[]] {
  const half = Math.ceil(rows.length / 2);
  return [rows.slice(0, half), rows.slice(half)];
}

/**
 * 포디움에 오르지 못한 순위 목록 — W-12 최종 순위(프로젝터)와 W-07 개요 탭이 함께 쓴다.
 * 두 화면이 같은 표를 그려야 해서 마크업을 한 곳에 둔다.
 */
export function RankColumns({
  rows,
  questionTotal,
}: {
  rows: FinalRankRow[];
  questionTotal: number;
}) {
  const [left, right] = splitColumns(rows);

  return (
    <div className="flex gap-10">
      {[left, right].map((column, i) => (
        <ol key={i} className="flex flex-1 flex-col">
          {column.map((row) => (
            <li
              key={row.student.id}
              className="flex items-center gap-2.5 border-b border-line-soft py-2.5"
            >
              <span className="w-6 shrink-0 text-body-md font-bold text-ink-disabled">
                {row.rank}
              </span>
              <StudentAvatar avatar={row.student.avatar} size={28} />
              <span className="w-20 shrink-0 truncate text-heading-sm font-bold">
                {row.student.name}
              </span>
              <span className="text-body-md text-muted-foreground">
                {row.correctCount === null ? "—" : `정답 ${row.correctCount} / ${questionTotal}`}
              </span>
              <span className="ml-auto shrink-0 text-heading-sm font-bold">{row.score}점</span>
            </li>
          ))}
        </ol>
      ))}
    </div>
  );
}
