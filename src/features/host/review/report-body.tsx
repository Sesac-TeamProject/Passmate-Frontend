"use client";

import { useState } from "react";
import type { SessionReport, ReportQuestion } from "@/features/host/types";
import { QUESTION_TYPE_LABEL } from "@/features/host/editor/question-type-chip";
import { cn } from "@/lib/utils";
import { AnalysisPanel } from "./analysis-panel";

const TABS = ["개요", "문항별", "학생별"] as const;
type Tab = (typeof TABS)[number];

type Props = { report: SessionReport; students: { id: string; name: string }[] };

/** W-07 본문 — 탭 · 문항 목록 · 우측 AI 분석/첨삭 패널 */
export function ReportBody({ report, students }: Props) {
  const [tab, setTab] = useState<Tab>("문항별");
  const [selectedId, setSelectedId] = useState(
    report.questions.find((q) => q.type === "essay")?.id ?? report.questions[0].id,
  );
  const selected = report.questions.find((q) => q.id === selectedId)!;

  return (
    <>
      <div role="tablist" className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full px-[18px] py-[9px] text-label-lg transition-colors",
              tab === t
                ? "bg-mint-tint text-mint-dark"
                : "bg-card text-muted-foreground hover:bg-muted",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "문항별" ? (
        <div className="flex flex-1 gap-5">
          <ol className="flex flex-1 flex-col gap-2.5">
            {report.questions.map((q) => (
              <li key={q.id}>
                <QuestionRow
                  question={q}
                  selected={q.id === selectedId}
                  onSelect={() => setSelectedId(q.id)}
                />
              </li>
            ))}
          </ol>
          <AnalysisPanel
            question={selected}
            answers={report.essayAnswers[selected.id] ?? []}
            students={students}
          />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-[20px] border border-dashed text-body-md text-muted-foreground">
          {tab} 탭은 데이터 연동 시 구현
        </div>
      )}
    </>
  );
}

function QuestionRow({
  question: q,
  selected,
  onSelect,
}: {
  question: ReportQuestion;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="flex w-full items-center gap-3 rounded-2xl border bg-card px-[18px] py-[15px] text-left transition-colors hover:border-mint"
    >
      <span
        className={cn(
          "flex h-7 w-9 shrink-0 items-center justify-center rounded-[10px] text-label-lg text-mint-dark",
          selected ? "bg-mint-tint" : "bg-muted",
        )}
      >
        Q{q.index}
      </span>
      <span className="flex-1 truncate text-label-lg text-ink">{q.title}</span>
      {q.type === "essay" ? (
        <span className="text-label-lg text-mint-dark">AI 분석 {q.aiCount}건</span>
      ) : (
        <>
          <span
            className={cn("h-2.5 rounded", (q.accuracy ?? 0) >= 80 ? "bg-mint-light" : "bg-yellow")}
            style={{ width: `${((q.accuracy ?? 0) / 100) * 110}px` }}
          />
          <span className="text-label-lg text-muted-foreground">{q.accuracy}%</span>
        </>
      )}
      <span className="sr-only">{QUESTION_TYPE_LABEL[q.type]}</span>
    </button>
  );
}
