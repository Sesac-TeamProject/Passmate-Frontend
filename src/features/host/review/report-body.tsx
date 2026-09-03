import type { QuestionInsight, ReportQuestion, SessionReport } from "@/features/host/types";
import { QUESTION_TYPE_LABEL } from "@/features/host/editor/question-type-chip";
import { cn } from "@/lib/utils";
import { QuestionInsightPanel } from "./question-insight-panel";

type Props = {
  report: SessionReport;
  /** 우측 상세 패널이 보고 있는 문항. 서술형 답변 조회를 구동하므로 컨테이너가 소유한다 */
  selectedQuestionId: string | null;
  onSelectQuestion: (id: string) => void;
  /** 선택된 문항의 채점 분포·AI 총평 (@draft) */
  insight: QuestionInsight | null;
  canSaveComment: boolean;
  onSaveComment: (text: string) => void;
};

/** W-07 문항별 탭 — 정답률 오름차순 표 + 많이 틀린 학생 + 우측 상세 패널 (시안 784:8881·8983) */
export function ReportBody({
  report,
  selectedQuestionId,
  onSelectQuestion,
  insight,
  canSaveComment,
  onSaveComment,
}: Props) {
  // 시안은 정답률이 낮은 문항부터 세운다 — 선생님이 먼저 봐야 할 순서다
  const sorted = [...report.questions].sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0));
  const selected = sorted.find((q) => q.id === selectedQuestionId) ?? sorted[0] ?? null;

  return (
    <div className="flex flex-1 gap-3">
      <div className="flex min-w-0 flex-1 flex-col rounded-lg border bg-card">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col className="w-[68px]" />
            <col className="w-[68px]" />
            <col className="w-auto" />
            <col className="w-28" />
            <col className="w-24" />
          </colgroup>
          <thead>
            <tr className="border-b text-label-md text-muted-foreground">
              <th scope="col" className="h-9 pl-[18px] text-left font-normal">
                문항
              </th>
              <th scope="col" className="h-9 text-left font-normal">
                유형
              </th>
              <th scope="col" className="h-9 text-left font-normal">
                문제
              </th>
              <th scope="col" className="h-9 text-left font-normal">
                정답률 ▾
              </th>
              <th scope="col" className="h-9 pr-[18px] text-left font-normal">
                오답
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((question) => (
              <QuestionRow
                key={question.id}
                question={question}
                selected={question.id === selected?.id}
                onSelect={() => onSelectQuestion(question.id)}
              />
            ))}
          </tbody>
        </table>

        {report.strugglers.length > 0 && (
          <section className="flex flex-col gap-2.5 border-t px-[18px] py-3.5">
            <h2 className="text-label-lg text-ink">많이 틀린 학생</h2>
            <ul className="flex flex-col">
              {report.strugglers.map((student) => (
                <li
                  key={student.id}
                  className="flex items-center gap-4 border-b border-line-soft py-2.5 last:border-b-0"
                >
                  <span className="w-40 shrink-0 truncate text-label-lg text-ink">
                    {student.name}
                  </span>
                  <span className="flex-1 text-label-md text-muted-foreground">
                    {student.correctCount === null
                      ? "미제출"
                      : `정답 ${student.correctCount}/${student.questionCount}`}
                  </span>
                  <span className="w-16 shrink-0 text-right text-label-lg text-ink">
                    {student.correctCount === null
                      ? "—"
                      : `${Math.round((student.correctCount / Math.max(1, student.questionCount)) * 100)}%`}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {selected === null ? (
        <div className="flex w-[424px] shrink-0 items-center justify-center rounded-lg border border-dashed text-body-md text-muted-foreground">
          문항이 없어요
        </div>
      ) : (
        <QuestionInsightPanel
          key={selected.id}
          question={selected}
          insight={insight}
          canSaveComment={canSaveComment}
          onSaveComment={onSaveComment}
        />
      )}
    </div>
  );
}

/** 표 한 줄. 고른 줄은 연민트 바탕 + 왼쪽 3px 민트 막대 (시안 784:8889·8890) */
function QuestionRow({
  question,
  selected,
  onSelect,
}: {
  question: ReportQuestion;
  selected: boolean;
  onSelect: () => void;
}) {
  const accuracy = question.accuracy ?? 0;
  const fill = accuracy >= 70 ? "bg-mint" : accuracy >= 50 ? "bg-choice-c" : "bg-choice-a";

  return (
    <tr
      onClick={onSelect}
      aria-selected={selected}
      className={cn(
        "relative cursor-pointer border-b border-line-soft last:border-b-0",
        selected ? "bg-mint-bg" : "hover:bg-muted",
      )}
    >
      <td className="h-11 pl-[18px] text-label-lg text-ink">
        {selected && <span aria-hidden className="absolute top-0 left-0 h-11 w-[3px] bg-mint" />}
        {/* 줄 전체가 눌리지만 키보드로도 고를 수 있게 문항 번호를 버튼으로 둔다 — 줄 클릭과 겹치지 않게 전파를 막는다 */}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
          className="text-left outline-none focus-visible:underline"
        >
          Q{question.index}
          <span className="sr-only"> 상세 보기</span>
        </button>
      </td>
      <td>
        <span className="inline-flex h-5 items-center rounded bg-muted px-1.5 text-label-md text-muted-foreground">
          {QUESTION_TYPE_LABEL[question.type]}
        </span>
      </td>
      <td className="max-w-0 truncate pr-4 text-label-lg text-ink">{question.title}</td>
      <td>
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-14 overflow-hidden rounded-full bg-line-soft">
            <span
              className={cn("block h-full rounded-full", fill)}
              style={{ width: `${accuracy}%` }}
            />
          </span>
          <span className="text-label-lg text-ink">{question.accuracy ?? "—"}%</span>
        </span>
      </td>
      <td className="pr-[18px] text-label-lg text-muted-foreground">
        {question.wrongCount === undefined ? "—" : `${question.wrongCount}명`}
      </td>
    </tr>
  );
}
