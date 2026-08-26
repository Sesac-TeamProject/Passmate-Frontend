"use client";

import { useState } from "react";
import type { Question } from "@/features/teacher/mock";
import { QuestionTypeChip } from "./question-type-chip";

type Props = { initial: Question[] };

/** W-03 우측 문항 검토 목록. 삭제는 로컬 상태로만 반영한다. */
export function QuestionList({ initial }: Props) {
  const [questions, setQuestions] = useState(initial);
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-ink">
          문항 {questions.length} · 총 배점 {totalPoints}
        </h2>
        <p className="text-xs text-[#73727c]">검토를 마쳐야 세트를 확정할 수 있어요</p>
      </div>
      <ol className="flex flex-col gap-3">
        {questions.map((q, i) => (
          <li
            key={q.id}
            className="flex items-center gap-3.5 rounded-[18px] border bg-card px-5 py-[17px]"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-muted text-[13px] font-black text-mint-dark">
              {i + 1}
            </span>
            <QuestionTypeChip type={q.type} />
            <p className="min-w-0 flex-1 truncate text-sm font-bold text-ink">{q.prompt}</p>
            <span className="shrink-0 text-xs text-muted-foreground">
              {q.points}점 · {q.seconds}초
            </span>
            <div className="flex shrink-0 gap-3 text-xs">
              <button type="button" className="font-black text-mint-dark hover:underline">
                수정
              </button>
              <button type="button" className="font-black text-mint-dark hover:underline">
                재생성
              </button>
              <button
                type="button"
                onClick={() => setQuestions((qs) => qs.filter((x) => x.id !== q.id))}
                className="font-bold text-[#7f7e88] hover:underline"
              >
                삭제
              </button>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
