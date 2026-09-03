"use client";

import { useState, type FormEvent } from "react";
import { PendingLabel } from "@/components/common/pending-label";
import type { QuestionType } from "@/features/host/types";
import type {
  AiGenerateRequest,
  Difficulty,
  QuestionType as WireQuestionType,
} from "@/lib/types/dto";
import { QUESTION_TYPE_LABEL } from "./question-type-chip";
import { DEFAULT_QUESTION_POINTS, DEFAULT_QUESTION_SECONDS } from "./types";

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: "EASY", label: "초급" },
  // 서버 enum은 MEDIUM이 아니라 NORMAL이다 (ERD·dbml 쪽이 낡았다 — data-model.md §1)
  { value: "NORMAL", label: "중급" },
  { value: "HARD", label: "고급" },
];

const COUNT_TYPES: QuestionType[] = ["multiple", "essay", "ox"];

const WIRE_TYPE: Record<QuestionType, WireQuestionType> = {
  multiple: "MCQ",
  essay: "ESSAY",
  ox: "OX",
};

/** 서버가 한 번에 만들 수 있는 최대 문항 수 (`AiGenerateRequest.MAX_GENERATE_COUNT`) */
const MAX_GENERATE_COUNT = 20;

/** 강의자료 본문 최대 길이 (`AiGenerateRequest.MATERIAL_MAX_LENGTH`) */
const MATERIAL_MAX_LENGTH = 5000;

type Props = {
  onGenerate: (body: AiGenerateRequest) => void;
  onAddManual: () => void;
  generating?: boolean;
  errorMessage?: string | null;
  /** 확정된 세트에는 문항을 더할 수 없다 */
  disabled?: boolean;
};

const FIELD =
  "h-[46px] w-full rounded-xl bg-muted px-3.5 text-label-lg text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** W-03 좌측 "AI로 문제 만들기" 조건 입력 패널 */
export function GeneratePanel({
  onGenerate,
  onAddManual,
  generating,
  errorMessage,
  disabled,
}: Props) {
  const [topic, setTopic] = useState("");
  const [material, setMaterial] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("NORMAL");
  const [counts, setCounts] = useState<Record<QuestionType, number>>({
    multiple: 5,
    essay: 3,
    ox: 0,
  });

  const total = COUNT_TYPES.reduce((sum, t) => sum + counts[t], 0);
  const tooMany = total > MAX_GENERATE_COUNT;
  const canSubmit = !generating && !disabled && total > 0 && !tooMany && topic.trim() !== "";

  function updateCount(type: QuestionType, value: number) {
    setCounts((c) => ({ ...c, [type]: Math.max(0, Math.min(MAX_GENERATE_COUNT, value)) }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    // counts는 배열이 아니라 **유형별 맵**이다 — 0인 유형은 키를 빼서 보낸다
    const wireCounts: AiGenerateRequest["counts"] = {};
    for (const type of COUNT_TYPES) {
      if (counts[type] > 0) wireCounts[WIRE_TYPE[type]] = counts[type];
    }

    onGenerate({
      topic: topic.trim(),
      counts: wireCounts,
      difficulty,
      // 자료를 넣으면 그 범위 안에서 출제한다. 비어 있으면 키를 아예 빼서 보낸다
      ...(material.trim() ? { material: material.trim() } : {}),
      timeLimitSec: DEFAULT_QUESTION_SECONDS,
      points: DEFAULT_QUESTION_POINTS,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-[340px] shrink-0 flex-col gap-3.5 self-start rounded-3xl border bg-card p-[26px]"
    >
      <h2 className="text-heading-md text-ink">AI로 문제 만들기</h2>

      <Field label="주제">
        <input
          className={FIELD}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          maxLength={100}
          placeholder="자료구조 - 스택과 큐"
        />
      </Field>
      <Field label={`유형별 문항 수 (합계 1~${MAX_GENERATE_COUNT})`}>
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
                max={MAX_GENERATE_COUNT}
                value={counts[t]}
                onChange={(e) => updateCount(t, Number(e.target.value))}
                className="h-8 w-16 rounded-lg bg-card px-2 text-right text-label-lg text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          ))}
        </div>
      </Field>
      <Field label="강의자료 붙여넣기 (선택)">
        <textarea
          value={material}
          onChange={(e) => setMaterial(e.target.value.slice(0, MATERIAL_MAX_LENGTH))}
          rows={3}
          placeholder="수업 자료를 붙여 넣으면 이 범위 안에서 출제해요"
          className="w-full resize-y rounded-xl bg-muted px-3.5 py-2.5 text-label-lg text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <span className="self-end text-label-md text-muted-foreground">
          {material.length} / {MATERIAL_MAX_LENGTH}자
        </span>
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
        disabled={!canSubmit}
        className="flex h-[50px] items-center justify-center rounded-[14px] bg-mint text-label-lg text-white transition-colors hover:bg-mint-dark disabled:opacity-60"
      >
        {generating ? <PendingLabel>생성 중…</PendingLabel> : `문항 ${total}개 생성하기`}
      </button>
      {errorMessage ? (
        <p role="alert" className="text-label-md text-negative">
          {errorMessage}
        </p>
      ) : tooMany ? (
        <p className="text-label-md text-negative">
          한 번에 {MAX_GENERATE_COUNT}개까지 만들 수 있어요
        </p>
      ) : (
        <p className="text-label-md text-muted-foreground">약 30초 걸려요 · 최초 5회는 무료예요</p>
      )}
      {/*
        남은 무료 횟수 표시는 아직 못 넣는다 — 잔여 횟수를 주는 응답이 서버에 없다.
        429 AI_FREE_LIMIT_EXCEEDED로 소진을 알 뿐이다(백엔드 질문 B-8 · DESIGN_GAPS G-1).

        PDF 업로드(`generate-from-file`)도 백엔드에 없다 — 위 텍스트 붙여넣기가 그 자리를 대신한다.
      */}
      <button
        type="button"
        onClick={onAddManual}
        disabled={disabled}
        className="flex h-[46px] items-center justify-center rounded-[14px] bg-muted text-label-lg text-mint-dark transition-colors hover:bg-mint-tint disabled:opacity-60"
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
