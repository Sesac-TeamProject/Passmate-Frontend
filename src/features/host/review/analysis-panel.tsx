"use client";

import { useState } from "react";
import type { EssayAnswer, ReportQuestion } from "@/features/host/types";
import { QUESTION_TYPE_LABEL } from "@/features/host/editor/question-type-chip";
import { cn } from "@/lib/utils";

type Props = {
  question: ReportQuestion;
  answers: EssayAnswer[];
  students: { id: string; name: string }[];
};

const DOT = { good: "bg-mint-light", lack: "bg-yellow", tip: "bg-muted-foreground" } as const;

/** W-07 우측 패널 — 서술형 답변별 AI 분석 확인, 코멘트 입력 */
export function AnalysisPanel({ question, answers, students }: Props) {
  const [cursor, setCursor] = useState(0);
  const [comment, setComment] = useState("");
  const answer = answers[Math.min(cursor, Math.max(answers.length - 1, 0))];
  const name = answer ? (students.find((s) => s.id === answer.studentId)?.name ?? "학생") : "";

  return (
    <aside className="flex w-[430px] shrink-0 flex-col overflow-hidden rounded-[20px] border bg-card">
      <h3 className="bg-mint px-[22px] py-[15px] text-label-lg text-white">
        Q{question.index} · {QUESTION_TYPE_LABEL[question.type]} ·{" "}
        {question.type === "essay" ? "AI 분석" : "결과"}
      </h3>
      {answer ? (
        <div className="flex flex-col gap-3 px-[22px] pt-4 pb-[18px]">
          <div className="flex items-center gap-2">
            <span className="flex size-[26px] items-center justify-center rounded-full bg-choice-a text-label-lg text-choice-a-foreground">
              {name.charAt(0)}
            </span>
            <span className="text-label-lg text-ink">{name}의 답변</span>
            <button
              type="button"
              onClick={() => setCursor((c) => (c + 1) % answers.length)}
              className="text-label-md text-muted-foreground hover:underline"
              aria-label="다음 답변"
            >
              {cursor + 1} / {answers.length}
            </button>
          </div>
          <p className="rounded-xl bg-muted px-3.5 py-3 text-body-md text-muted-foreground">
            {answer.text}
          </p>
          <ul className="flex flex-col gap-3">
            {answer.findings.map((f) => (
              <li key={f.text} className="flex items-center gap-2 text-label-lg text-ink">
                <span className={cn("size-[7px] shrink-0 rounded-full", DOT[f.tone])} />
                {f.text}
              </li>
            ))}
          </ul>
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="코멘트를 남겨 첨삭을 마무리하세요"
            className="h-[46px] rounded-xl bg-muted px-3.5 text-body-md text-ink outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="button"
            className="h-[42px] rounded-xl bg-mint text-label-lg text-white transition-colors hover:bg-mint-dark"
          >
            코멘트 저장
          </button>
        </div>
      ) : (
        <p className="px-[22px] py-6 text-body-md text-muted-foreground">
          객관식·OX 문항은 자동 채점됩니다. 첨삭할 답변이 없어요.
        </p>
      )}
    </aside>
  );
}
