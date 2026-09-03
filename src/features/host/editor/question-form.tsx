"use client";

import type { FormEvent } from "react";
import { PendingLabel } from "@/components/common/pending-label";
import type { QuestionType } from "@/features/host/types";
import { QUESTION_TYPE_LABEL } from "./question-type-chip";
import type { QuestionFormValues } from "./types";

const FIELD =
  "h-[46px] w-full rounded-xl bg-muted px-3.5 text-label-lg text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring";
const TYPES: QuestionType[] = ["multiple", "ox", "essay"];

type Props = {
  values: QuestionFormValues;
  onChange: (values: QuestionFormValues) => void;
  onSubmit: () => void;
  onCancel: () => void;
  pending?: boolean;
  errorMessage?: string | null;
  /** 수정이면 "저장", 추가면 "문항 추가" */
  mode: "create" | "edit";
};

/**
 * W-03 문항 직접 추가·수정 폼. 렌더 전용 — 상태와 저장은 컨테이너가 가진다.
 *
 * 입력 제한은 서버가 400으로 막는 값과 같게 둔다(`data-model.md` §4):
 * 제한시간 5~600초 · 배점 1~1000 · MCQ 보기 2개 이상 · 정답은 **보기 원문**.
 */
export function QuestionForm({
  values,
  onChange,
  onSubmit,
  onCancel,
  pending,
  errorMessage,
  mode,
}: Props) {
  const set = (patch: Partial<QuestionFormValues>) => onChange({ ...values, ...patch });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pending) onSubmit();
  };

  const setChoice = (index: number, text: string) => {
    set({ choices: values.choices.map((c, i) => (i === index ? text : c)) });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3.5 rounded-[18px] border-2 border-mint bg-card p-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-heading-sm text-ink">
          {mode === "edit" ? "문항 수정" : "문항 직접 추가"}
        </h3>
        <div className="flex gap-2">
          {TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => set({ type, answer: "" })}
              className={
                type === values.type
                  ? "rounded-full bg-mint px-3 py-1 text-label-lg text-white"
                  : "rounded-full bg-muted px-3 py-1 text-label-lg text-muted-foreground hover:bg-mint-tint"
              }
            >
              {QUESTION_TYPE_LABEL[type]}
            </button>
          ))}
        </div>
      </div>

      <Field label="지문">
        <textarea
          value={values.prompt}
          onChange={(e) => set({ prompt: e.target.value })}
          rows={2}
          className="w-full resize-y rounded-xl bg-muted px-3.5 py-2.5 text-label-lg text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </Field>

      {values.type === "multiple" ? (
        <Field label="보기 (2개 이상) · 정답을 눌러 고르세요">
          <div className="flex flex-col gap-1.5">
            {values.choices.map((choice, index) => (
              // 보기는 순서로만 구분되고 내용이 겹칠 수 있어 인덱스를 키로 쓴다(행 추가·삭제는 끝에서만)
              <div key={index} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => set({ answer: choice })}
                  disabled={choice.trim() === ""}
                  className={
                    choice.trim() !== "" && choice === values.answer
                      ? "shrink-0 rounded-lg bg-mint px-2.5 py-1.5 text-label-md text-white"
                      : "shrink-0 rounded-lg bg-muted px-2.5 py-1.5 text-label-md text-muted-foreground disabled:opacity-50"
                  }
                >
                  정답
                </button>
                <input
                  className={FIELD}
                  value={choice}
                  onChange={(e) => setChoice(index, e.target.value)}
                  placeholder={`보기 ${index + 1}`}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => set({ choices: [...values.choices, ""] })}
              className="self-start text-label-md text-mint-dark hover:underline"
            >
              + 보기 추가
            </button>
          </div>
        </Field>
      ) : null}

      {values.type === "ox" ? (
        <Field label="정답">
          <div className="flex gap-2">
            {["O", "X"].map((mark) => (
              <button
                key={mark}
                type="button"
                onClick={() => set({ answer: mark })}
                className={
                  values.answer === mark
                    ? "h-[46px] flex-1 rounded-xl bg-mint text-label-lg text-white"
                    : "h-[46px] flex-1 rounded-xl bg-muted text-label-lg text-ink hover:bg-mint-tint"
                }
              >
                {mark}
              </button>
            ))}
          </div>
        </Field>
      ) : null}

      {values.type === "essay" ? (
        <Field label="모범답안 (채점 기준)">
          <textarea
            value={values.answer}
            onChange={(e) => set({ answer: e.target.value })}
            rows={2}
            className="w-full resize-y rounded-xl bg-muted px-3.5 py-2.5 text-label-lg text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </Field>
      ) : null}

      <Field label="해설 (선택)">
        <input
          className={FIELD}
          value={values.explanation}
          onChange={(e) => set({ explanation: e.target.value })}
        />
      </Field>

      <div className="flex gap-3">
        <Field label="배점 (1~1000)">
          <input
            type="number"
            min={1}
            max={1000}
            className={FIELD}
            value={values.points}
            onChange={(e) => set({ points: Number(e.target.value) })}
          />
        </Field>
        <Field label="제한 시간 (5~600초)">
          <input
            type="number"
            min={5}
            max={600}
            className={FIELD}
            value={values.seconds}
            onChange={(e) => set({ seconds: Number(e.target.value) })}
          />
        </Field>
      </div>

      {errorMessage ? (
        <p role="alert" className="text-label-md text-negative">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex h-[46px] flex-1 items-center justify-center rounded-[14px] bg-mint text-label-lg text-white transition-colors hover:bg-mint-dark disabled:opacity-60"
        >
          {pending ? <PendingLabel>저장 중…</PendingLabel> : mode === "edit" ? "저장" : "문항 추가"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-[46px] rounded-[14px] bg-muted px-5 text-label-lg text-muted-foreground hover:bg-mint-tint"
        >
          취소
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="text-label-lg text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
