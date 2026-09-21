"use client";

import { useState, type FormEvent } from "react";
import { BetaNotice } from "@/components/common/beta-notice";
import { PendingLabel } from "@/components/common/pending-label";
import { Stepper } from "@/components/common/stepper";
import type { QuestionType } from "@/features/host/types";
import { cn } from "@/lib/utils";
import type {
  AiQuotaResponse,
  AiGenerateRequest,
  Difficulty,
  QuestionType as WireQuestionType,
} from "@/lib/types/dto";
import { MaterialAttach } from "./material-attach";
import { QUESTION_TYPE_LABEL } from "./question-type-chip";
import { DEFAULT_ESSAY_SECONDS, DEFAULT_QUESTION_POINTS, DEFAULT_QUESTION_SECONDS } from "./types";

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

type Props = {
  onGenerate: (body: AiGenerateRequest) => void;
  onAddManual: () => void;
  generating?: boolean;
  errorMessage?: string | null;
  /** 확정된 세트에는 문항을 더할 수 없다 */
  disabled?: boolean;
  /** AI 생성 무료 한도·잔여. 아직 못 읽었으면 undefined — 숫자를 지어내지 않고 한도만 안내한다 */
  quota?: AiQuotaResponse;
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
  quota,
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
  // 한도를 다 쓰면 서버가 429로 거절한다 — 눌러 보고 나서야 아는 대신 버튼부터 잠근다.
  // 아직 못 읽었으면(undefined) 잠그지 않는다: 없는 0을 지어내지 않고 서버 판정에 맡긴다
  const quotaExhausted = quota?.remainingCount === 0;
  const canSubmit =
    !generating && !disabled && !quotaExhausted && total > 0 && !tooMany && topic.trim() !== "";

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
      // 제한시간은 보내지 않는다 — 서버가 유형별 기본(객관식·OX 30초, 서술형 90초)을 넣는다.
      // 30초를 박아 보내던 때는 서술형까지 30초가 됐다(W-02b "서술형은 기본 90초").
      points: DEFAULT_QUESTION_POINTS,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-[340px] shrink-0 flex-col gap-3.5 self-start rounded-3xl border bg-card p-[26px] max-md:w-full max-md:p-5"
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
        <p className="flex items-center justify-between gap-2 rounded-xl bg-surface-subtle px-3.5 py-2">
          {/* 패널이 340px라 둘 다 줄어들면 "문항 수 4문 / 항"처럼 라벨이 글자 중간에서 끊긴다.
              라벨을 고정하고 남는 폭은 오른쪽 안내가 가져가 거기서 줄바꿈한다 */}
          <span className="shrink-0 text-label-lg text-ink">문항 수 {total}문항</span>
          <span className="text-right text-label-md text-muted-foreground">
            유형별 합계 · 객관식·OX {DEFAULT_QUESTION_SECONDS}초 · 서술형 {DEFAULT_ESSAY_SECONDS}초
          </span>
        </p>
      </Field>
      {/* 붙여넣기 대신 파일 첨부 — 선생님 자료는 대부분 PDF·PPT 다. 서버가 본문만 뽑아 준다.
          label 로 감싸면 안의 제거(✕) 버튼 클릭까지 파일 선택을 다시 연다 — Field 를 안 쓴다 */}
      <div className="flex flex-col gap-1.5">
        <span className="text-label-lg text-muted-foreground">강의자료 첨부 (선택)</span>
        <MaterialAttach onMaterialChange={setMaterial} disabled={disabled} />
      </div>
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

      {/*
        베타 안내 (Figma "13 · 베타 운영" W-03β). 예전 "AI 생성 비용" 박스가 패널 맨 아래에 있어
        생성 버튼을 누른 뒤에야 보였다 — 버튼 바로 위로 올렸다.

        한도·잔여는 `GET /users/me/ai-quota`가 준다 — 5회를 화면 상수로 복제하지 않는다.
        생성·재생성이 한도를 공유하고(FR-076), 실패한 호출은 세지 않는다.
        한도를 넘기면 서버는 코인을 차감하지 않고 429 AI_FREE_LIMIT_EXCEEDED로 거절한다
        (`AiQuestionService.verifyFreeLimit`, 2026-09-04 확인) — 그래서 "이후 코인 차감"은 적지 않는다.
      */}
      {quota === undefined ? (
        <BetaNotice title="AI 문제 생성 횟수 제한">
          베타 기간에는 AI 문제 생성 횟수가 제한됩니다.
        </BetaNotice>
      ) : quotaExhausted ? (
        <BetaNotice title={`AI 문제 생성 ${quota.freeLimit}회를 모두 사용함`}>
          베타 기간에는 AI 문제 생성을 1인 {quota.freeLimit}회까지 이용할 수 있습니다. 필요한 문항은
          직접 추가할 수 있습니다.
        </BetaNotice>
      ) : (
        <BetaNotice title={`AI 문제 생성 ${quota.remainingCount}회 남음`}>
          베타 기간에는 AI 문제 생성을 1인 {quota.freeLimit}회까지 이용할 수 있습니다.
        </BetaNotice>
      )}

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
