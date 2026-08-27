import Link from "next/link";
import type { QuestionSet } from "@/features/teacher/mock";
import { QUESTION_TYPE_LABEL } from "@/features/teacher/editor/question-type-chip";
import { cn } from "@/lib/utils";

const CHIP: Record<QuestionSet["composition"][number]["type"], string> = {
  multiple: "bg-muted text-mint-dark",
  essay: "bg-[#deedff] text-[#0e61d9]",
  ox: "bg-[#fdefde] text-[#bf3f0c]",
};

/** W-08 우측 패널 — 선택한 세트 요약·문항 미리보기·재활용 액션 */
export function SetDetailPanel({ set }: { set: QuestionSet }) {
  const more = set.questionCount - set.preview.length;

  return (
    <aside className="flex w-[360px] shrink-0 flex-col gap-3 bg-card p-6">
      <h2 className="text-heading-md text-ink">{set.title}</h2>
      <div className="flex gap-1.5">
        {set.composition.map((c) => (
          <span key={c.type} className={cn("rounded-full px-2.5 py-1 text-label-lg", CHIP[c.type])}>
            {QUESTION_TYPE_LABEL[c.type]} {c.count}
          </span>
        ))}
      </div>
      <p className="text-label-md text-muted-foreground">
        총 배점 {set.totalPoints} · 예상 {set.minutes}분
        {set.usage ? ` · 마지막 사용 ${set.usage.lastUsed}` : " · 미사용"}
      </p>
      <hr className="border-muted" />
      <h3 className="text-label-lg text-muted-foreground">문항 미리보기</h3>
      <ol className="flex flex-col">
        {set.preview.map((text, i) => (
          <li key={text} className="flex items-center gap-2.5 py-2 text-label-lg text-ink">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-muted text-label-lg text-mint-dark">
              {i + 1}
            </span>
            {text}
          </li>
        ))}
      </ol>
      {more > 0 && <p className="text-label-md text-muted-foreground">··· {more}문항 더</p>}
      <div className="mt-auto flex flex-col gap-3">
        <Link
          href="/teacher/rooms/new"
          className="flex h-[50px] items-center justify-center rounded-[14px] bg-mint text-label-lg text-white transition-colors hover:bg-mint-dark"
        >
          이 세트로 방 만들기
        </Link>
        <Link
          href="/teacher/editor"
          className="flex h-[46px] items-center justify-center rounded-[14px] bg-muted text-label-lg text-mint-dark transition-colors hover:bg-mint-tint"
        >
          복제해서 수정하기
        </Link>
      </div>
    </aside>
  );
}
