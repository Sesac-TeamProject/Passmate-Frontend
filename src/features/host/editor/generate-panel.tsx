"use client";

import { useState, type FormEvent } from "react";
import { PendingLabel } from "@/components/common/pending-label";
import { Stepper } from "@/components/common/stepper";
import type { QuestionType } from "@/features/host/types";
import { cn } from "@/lib/utils";
import type {
  AiGenerateRequest,
  Difficulty,
  QuestionType as WireQuestionType,
} from "@/lib/types/dto";
import { QUESTION_TYPE_LABEL } from "./question-type-chip";
import { DEFAULT_QUESTION_POINTS, DEFAULT_QUESTION_SECONDS } from "./types";

/** 라벨은 시안(W-03) 문구다 — 서버 enum과 이름이 다르니 값만 그대로 보낸다 */
const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: "EASY", label: "쉬움" },
  // 서버 enum은 MEDIUM이 아니라 NORMAL이다 (ERD·dbml 쪽이 낡았다 — data-model.md §1)
  { value: "NORMAL", label: "보통" },
  { value: "HARD", label: "어려움" },
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

/**
 * 무료 생성 횟수. 서버 정책값(`AiPolicy.aiFreeLimit`)을 안내 문구에 복제해 둔 것이라
 * 서버가 바꾸면 여기도 바꿔야 한다 — 잔여 횟수를 주는 응답이 생기면 이 상수는 지운다.
 */
const AI_FREE_LIMIT = 5;

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
              <Stepper
                label={`${QUESTION_TYPE_LABEL[t]} 문항 수`}
                value={counts[t]}
                onChange={(next) => updateCount(t, next)}
                min={0}
                max={MAX_GENERATE_COUNT}
                step={1}
              />
            </div>
          ))}
        </div>
        {/* 시안 W-03: 스테퍼 아래 합계 한 줄. 제한 시간·배점은 이 화면이 값을 실어 보낸다
            — "자동"이 아니므로 그렇게 적지 않는다(문항별 시간은 나중에 바꿀 수 있다) */}
        <p className="flex items-center justify-between rounded-xl bg-surface-subtle px-3.5 py-2">
          <span className="text-label-lg text-ink">문항 수 {total}문항</span>
          <span className="text-label-md text-muted-foreground">
            유형별 합계 · 문항당 {DEFAULT_QUESTION_SECONDS}초
          </span>
        </p>
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
      {/* 시안 W-03은 셀렉트가 아니라 세그먼트다 — 선택지가 셋뿐이라 한눈에 보인다 */}
      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-label-lg text-muted-foreground">난이도</legend>
        <div role="radiogroup" aria-label="난이도" className="flex gap-1 rounded-xl bg-muted p-1">
          {DIFFICULTY_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={difficulty === o.value}
              onClick={() => setDifficulty(o.value)}
              className={cn(
                "h-[38px] flex-1 rounded-lg text-label-lg transition-colors",
                difficulty === o.value
                  ? "bg-card text-mint-dark"
                  : "text-muted-foreground hover:text-ink",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </fieldset>

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
        <p className="text-label-md text-muted-foreground">약 30초 걸려요</p>
      )}

      {/*
        시안 W-03의 "AI 생성 비용" 박스. 시안 문구는 "이후 코인 차감"이지만 **서버는 차감하지
        않는다** — 무료 한도를 넘기면 429 AI_FREE_LIMIT_EXCEEDED로 거절한다
        (`AiQuestionService.verifyFreeLimit`, 2026-09-04 확인). 없는 결제를 적으면 거짓말이 되므로
        소진 뒤 실제로 남는 길(직접 추가)을 적는다. 코인 차감이 붙으면 이 문구를 시안대로 되돌린다.

        남은 무료 횟수(`AI 생성 n회 남음`)는 아직 못 그린다 — 백엔드에 `remainingFreeCount()`가
        있지만 어느 응답에도 실리지 않는다(백엔드 요청 B-7 · DESIGN_GAPS G-1).

        PDF 업로드(`generate-from-file`)도 백엔드에 없다 — 위 텍스트 붙여넣기가 그 자리를 대신한다.
      */}
      <p className="flex flex-col gap-0.5 rounded-xl bg-mint-tint px-3.5 py-2.5">
        <span className="text-label-lg text-mint-dark">AI 생성 비용</span>
        <span className="text-label-md text-mint-dark">
          최초 {AI_FREE_LIMIT}회 무료 · 다 쓰면 직접 문항 추가로 이어 갈 수 있어요
        </span>
      </p>

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
