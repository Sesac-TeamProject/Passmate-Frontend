"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { ChoiceKey, LiveQuestion } from "@/features/teacher/mock";
import { CHOICE_CLASS } from "@/features/teacher/live/choice-letter";
import { QUESTION_TYPE_LABEL } from "@/features/teacher/editor/question-type-chip";
import { cn } from "@/lib/utils";

type Props = { question: LiveQuestion; resultHref: string; banner?: ReactNode };

const mmss = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/** P-Web 풀이 카드 — 문항 헤더(타이머) + 선택지 + 제출 */
export function PlayCard({ question: q, resultHref, banner }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<ChoiceKey | null>("A");
  const [remaining, setRemaining] = useState(q.remaining);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = window.setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => window.clearTimeout(id);
  }, [remaining]);

  return (
    <>
      <div className="flex h-10 items-center justify-between">
        <span className="text-sm font-black text-[#73727c]">
          Q{q.index} / {q.total} · {QUESTION_TYPE_LABEL[q.type]}
        </span>
        <span className="rounded-full bg-[#f3b440] px-3 py-[5px] text-sm font-black text-ink tabular-nums">
          {mmss(remaining)}
        </span>
      </div>

      {banner}

      <section className="flex flex-col gap-3.5 rounded-[24px] border bg-card px-8 pt-7 pb-6">
        <h1 className="text-[17px] leading-[1.45] font-black text-ink">{q.prompt}</h1>
        <ol className="flex flex-col gap-3.5">
          {q.choices.map((c) => {
            const active = selected === c.key;
            return (
              <li key={c.key}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelected(c.key)}
                  className={cn(
                    "flex h-12 w-full items-center gap-3 rounded-xl px-3.5 text-sm font-black transition-colors",
                    active ? "bg-mint text-white" : "bg-muted text-ink hover:bg-mint-bg",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-[26px] shrink-0 items-center justify-center rounded-lg text-xs font-black",
                      active ? "bg-card text-mint-dark" : CHOICE_CLASS[c.key].solid,
                    )}
                  >
                    {c.key}
                  </span>
                  <span className="flex-1 text-left">{c.text}</span>
                  {active && <span aria-hidden>✓</span>}
                </button>
              </li>
            );
          })}
        </ol>
        <button
          type="button"
          disabled={!selected}
          onClick={() => router.push(resultHref)}
          className="flex h-[50px] items-center justify-center rounded-[14px] bg-mint text-[15px] font-black text-white transition-colors hover:bg-mint-dark disabled:opacity-50"
        >
          제출하기
        </button>
      </section>
    </>
  );
}
