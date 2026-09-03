import { QuestionTypeChip } from "./question-type-chip";
import type { EditorQuestion } from "./types";

type Props = {
  questions: EditorQuestion[];
  /** 순서·삭제·재생성 중인 문항 id. 그 행의 버튼만 잠근다 */
  busyQuestionId?: number | null;
  onEdit: (question: EditorQuestion) => void;
  onRegenerate: (question: EditorQuestion) => void;
  onDelete: (question: EditorQuestion) => void;
  onMove: (question: EditorQuestion, direction: "up" | "down") => void;
  /** 확정된 세트는 문항을 고칠 수 없다(서버가 409로 막는다) */
  readOnly?: boolean;
};

const ACTION =
  "text-mint-dark hover:underline disabled:text-muted-foreground disabled:no-underline";

/**
 * W-03 우측 문항 검토 목록. 렌더 전용 — 삭제·재생성·순서는 컨테이너가 서버에 반영한다.
 *
 * 예전 판은 삭제를 로컬 state로만 반영해 새로고침하면 되살아났다. 지금은 문항 단위 API
 * (`POST/PUT/DELETE …/questions`)가 있어 서버가 진실이다(R-12).
 */
export function QuestionList({
  questions,
  busyQuestionId,
  onEdit,
  onRegenerate,
  onDelete,
  onMove,
  readOnly,
}: Props) {
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-heading-sm text-ink">
          문항 {questions.length} · 총 배점 {totalPoints}
        </h2>
        <p className="text-label-md text-muted-foreground">
          {readOnly ? "확정한 세트는 고칠 수 없어요" : "검토를 마쳐야 세트를 확정할 수 있어요"}
        </p>
      </div>

      {questions.length === 0 ? (
        <p className="rounded-[18px] border border-dashed bg-card px-5 py-8 text-center text-label-lg text-muted-foreground">
          아직 문항이 없어요. AI로 만들거나 직접 추가해 주세요
        </p>
      ) : null}

      <ol className="flex flex-col gap-3">
        {questions.map((q, i) => (
          <li
            key={q.id}
            className="flex items-center gap-3.5 rounded-[18px] border bg-card px-5 py-[17px]"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-muted text-label-lg text-mint-dark">
              {q.orderNo}
            </span>
            <QuestionTypeChip type={q.type} />
            <p className="min-w-0 flex-1 truncate text-label-lg text-ink">{q.prompt}</p>
            <span className="shrink-0 text-label-md text-muted-foreground">
              {q.points}점 · {q.seconds}초
            </span>

            {readOnly ? null : (
              <div className="flex shrink-0 items-center gap-3 text-label-lg">
                <div className="flex flex-col">
                  <button
                    type="button"
                    aria-label={`${q.orderNo}번 문항 위로`}
                    disabled={i === 0 || busyQuestionId != null}
                    onClick={() => onMove(q, "up")}
                    className="text-muted-foreground hover:text-mint-dark disabled:opacity-40"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    aria-label={`${q.orderNo}번 문항 아래로`}
                    disabled={i === questions.length - 1 || busyQuestionId != null}
                    onClick={() => onMove(q, "down")}
                    className="text-muted-foreground hover:text-mint-dark disabled:opacity-40"
                  >
                    ▼
                  </button>
                </div>
                <button
                  type="button"
                  className={ACTION}
                  disabled={busyQuestionId != null}
                  onClick={() => onEdit(q)}
                >
                  수정
                </button>
                {/* 재생성은 AI가 만든 문항만 — 직접 쓴 문항에는 다시 만들 근거(주제·난이도)가 없다 */}
                {q.isAiGenerated ? (
                  <button
                    type="button"
                    className={ACTION}
                    disabled={busyQuestionId != null}
                    onClick={() => onRegenerate(q)}
                    title="AI 무료 생성 횟수를 하나 씁니다"
                  >
                    {busyQuestionId === q.id ? "재생성 중…" : "재생성"}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="text-muted-foreground hover:underline disabled:opacity-40"
                  disabled={busyQuestionId != null}
                  onClick={() => onDelete(q)}
                >
                  삭제
                </button>
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
