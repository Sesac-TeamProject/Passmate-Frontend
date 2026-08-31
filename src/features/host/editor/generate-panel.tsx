"use client";

import { useState, type FormEvent } from "react";
import type { QuestionType } from "@/features/host/types";
import type { AiUsageResponse, GenerateQuestionSetRequest } from "@/lib/types/dto";
import { QUESTION_TYPE_LABEL } from "./question-type-chip";

type Difficulty = GenerateQuestionSetRequest["difficulty"];

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: "EASY", label: "초급" },
  { value: "MEDIUM", label: "중급" },
  { value: "HARD", label: "고급" },
];

const COUNT_TYPES: QuestionType[] = ["multiple", "essay", "ox"];

const DTO_TYPE: Record<QuestionType, GenerateQuestionSetRequest["counts"][number]["type"]> = {
  multiple: "MULTIPLE_CHOICE",
  essay: "ESSAY",
  ox: "OX",
};

type Props = {
  usage?: AiUsageResponse;
  onGenerate: (body: GenerateQuestionSetRequest) => void;
  generating?: boolean;
  errorMessage?: string | null;
};

const FIELD =
  "h-[46px] w-full rounded-xl bg-muted px-3.5 text-label-lg text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** W-03 좌측 "AI로 문제 만들기" 조건 입력 패널 */
export function GeneratePanel({ usage, onGenerate, generating, errorMessage }: Props) {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("MEDIUM");
  const [counts, setCounts] = useState<Record<QuestionType, number>>({
    multiple: 5,
    essay: 3,
    ox: 0,
  });

  const total = COUNT_TYPES.reduce((sum, t) => sum + counts[t], 0);

  function updateCount(type: QuestionType, value: number) {
    setCounts((c) => ({ ...c, [type]: Math.max(0, Math.min(30, value)) }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (generating || total === 0) return;
    onGenerate({
      topic,
      difficulty,
      counts: COUNT_TYPES.filter((t) => counts[t] > 0).map((t) => ({
        type: DTO_TYPE[t],
        count: counts[t],
      })),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-[340px] shrink-0 flex-col gap-3.5 self-start rounded-3xl border bg-card p-[26px]"
    >
      <h2 className="text-heading-md text-ink">AI로 문제 만들기</h2>

      <Field label="주제">
        <input className={FIELD} value={topic} onChange={(e) => setTopic(e.target.value)} />
      </Field>
      <Field label="유형별 문항 수">
        <div className="flex flex-col gap-1.5">
          {COUNT_TYPES.map((t) => (
            <div
              key={t}
              className="flex items-center justify-between rounded-xl bg-muted px-3.5 py-2"
            >
              <span className="text-label-lg text-ink">{QUESTION_TYPE_LABEL[t]}</span>
              <input
                type="number"
                min={0}
                max={30}
                value={counts[t]}
                onChange={(e) => updateCount(t, Number(e.target.value))}
                className="h-8 w-16 rounded-lg bg-card px-2 text-right text-label-lg text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          ))}
        </div>
      </Field>
      <Field label="난이도">
        <select
          className={`${FIELD} appearance-none`}
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
        >
          {DIFFICULTY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <button
        type="submit"
        disabled={generating || total === 0}
        className="flex h-[50px] items-center justify-center rounded-[14px] bg-mint text-label-lg text-white transition-colors hover:bg-mint-dark disabled:opacity-60"
      >
        {generating ? "생성 중…" : `문항 ${total}개 생성하기`}
      </button>
      {errorMessage ? (
        <p role="alert" className="text-label-md text-negative">
          {errorMessage}
        </p>
      ) : (
        <p className="text-label-md text-muted-foreground">
          약 30초 걸려요 · 실패하면 자동 재시도 1번
        </p>
      )}
      {usage && (
        // TODO(design): DESIGN_GAPS W-03 잔여 횟수 — 시안 없음, 작은 라벨로 임시 배치
        <p className="text-label-md text-muted-foreground">
          무료 생성 {usage.generationLeft}/{usage.generationLimit}회 남음
        </p>
      )}
      <button
        type="button"
        className="flex h-[46px] items-center justify-center rounded-[14px] bg-muted text-label-lg text-mint-dark transition-colors hover:bg-mint-tint"
      >
        + 직접 문항 추가
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-label-lg text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
