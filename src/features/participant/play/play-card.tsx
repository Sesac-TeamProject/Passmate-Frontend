"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { ChoiceKey, LiveQuestion } from "@/features/host/types";
import { CHOICE_CLASS } from "@/features/host/live/choice-letter";
import { QUESTION_TYPE_LABEL } from "@/features/host/editor/question-type-chip";
import { cn } from "@/lib/utils";

type Props = {
  question: LiveQuestion;
  /** 객관식·OX는 고른 보기의 원문, 서술형은 입력한 텍스트 */
  onSubmit: (content: string) => void;
  submitting?: boolean;
  /** 이 문항을 이미 제출했으면 재제출을 막고 완료 상태를 보인다 */
  hasSubmitted?: boolean;
  banner?: ReactNode;
};

const mmss = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/** P-Web 풀이 카드 — 문항 헤더(타이머) + 선택지·서술형 입력 + 제출 */
export function PlayCard({
  question: q,
  onSubmit,
  submitting = false,
  hasSubmitted = false,
  banner,
}: Props) {
  const [selected, setSelected] = useState<ChoiceKey | null>(null);
  const [essay, setEssay] = useState("");
  const [remaining, setRemaining] = useState(q.remaining);
  const [syncedIndex, setSyncedIndex] = useState(q.index);

  // 문항이 바뀌면(index 변경) 이전 선택·서술형 입력을 지우고 남은 시간을 서버 값으로 다시 맞춘다.
  // 렌더 중 조정(react.dev "Adjusting state when a prop changes") — 매 초 흐르는 remaining까지 의존성에 넣지 않는다.
  if (q.index !== syncedIndex) {
    setSyncedIndex(q.index);
    setSelected(null);
    setEssay("");
    setRemaining(q.remaining);
  }

  useEffect(() => {
    if (remaining <= 0) return;
    const id = window.setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => window.clearTimeout(id);
  }, [remaining]);

  const isEssay = q.type === "essay";
  const disabled = hasSubmitted || submitting;
  const content = isEssay ? essay.trim() : (q.choices.find((c) => c.key === selected)?.text ?? "");
  const canSubmit = !disabled && content.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(content);
  };

  return (
    <>
      <div className="flex h-10 items-center justify-between">
        <span className="text-label-lg text-muted-foreground">
          Q{q.index} / {q.total} · {QUESTION_TYPE_LABEL[q.type]}
        </span>
        <span className="rounded-full bg-yellow px-3 py-[5px] text-label-lg text-ink tabular-nums">
          {mmss(remaining)}
        </span>
      </div>

      {banner}

      <section className="flex flex-col gap-3.5 rounded-3xl border bg-card px-8 pt-7 pb-6">
        <h1 className="text-heading-sm text-ink">{q.prompt}</h1>

        {isEssay ? (
          <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            disabled={disabled}
            placeholder="답을 입력하세요"
            rows={6}
            className="w-full resize-none rounded-xl border bg-muted px-3.5 py-3 text-body-md text-ink outline-none focus-visible:ring-2 focus-visible:ring-mint disabled:opacity-60"
          />
        ) : (
          <ol className="flex flex-col gap-3.5">
            {q.choices.map((c) => {
              const active = selected === c.key;
              return (
                <li key={c.key}>
                  <button
                    type="button"
                    aria-pressed={active}
                    disabled={disabled}
                    onClick={() => setSelected(c.key)}
                    className={cn(
                      "flex h-12 w-full items-center gap-3 rounded-xl px-3.5 text-label-lg transition-colors disabled:opacity-60",
                      active ? "bg-mint text-white" : "bg-muted text-ink hover:bg-mint-bg",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-[26px] shrink-0 items-center justify-center rounded-lg text-label-lg",
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
        )}

        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="flex h-[50px] items-center justify-center rounded-[14px] bg-mint text-heading-sm text-white transition-colors hover:bg-mint-dark disabled:opacity-50"
        >
          {hasSubmitted ? "제출 완료" : "제출하기"}
        </button>
      </section>
    </>
  );
}
