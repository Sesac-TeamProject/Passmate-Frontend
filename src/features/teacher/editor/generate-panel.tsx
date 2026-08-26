"use client";

import { useState, type FormEvent } from "react";

type Condition = { topic: string; composition: string; level: string; count: number };

type Props = { initial: Condition };

const FIELD =
  "h-[46px] w-full rounded-xl bg-muted px-3.5 text-sm font-bold text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** W-03 좌측 "AI로 문제 만들기" 조건 입력 패널 */
export function GeneratePanel({ initial }: Props) {
  const [cond, setCond] = useState(initial);
  const [generating, setGenerating] = useState(false);

  function update<K extends keyof Condition>(key: K, value: Condition[K]) {
    setCond((c) => ({ ...c, [key]: value }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO(API): AI 생성 요청. 지금은 로딩 상태만 흉내 낸다.
    setGenerating(true);
    window.setTimeout(() => setGenerating(false), 1500);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-[340px] shrink-0 flex-col gap-3.5 self-start rounded-[24px] border bg-card p-[26px]"
    >
      <h2 className="text-lg font-black text-ink">AI로 문제 만들기</h2>

      <Field label="주제">
        <input
          className={FIELD}
          value={cond.topic}
          onChange={(e) => update("topic", e.target.value)}
        />
      </Field>
      <Field label="유형 구성">
        <input
          className={FIELD}
          value={cond.composition}
          onChange={(e) => update("composition", e.target.value)}
        />
      </Field>
      <Field label="난이도">
        <select
          className={`${FIELD} appearance-none`}
          value={cond.level}
          onChange={(e) => update("level", e.target.value)}
        >
          <option>초급</option>
          <option>중급</option>
          <option>고급</option>
        </select>
      </Field>
      <Field label="문항 수">
        <input
          type="number"
          min={1}
          max={30}
          className={FIELD}
          value={cond.count}
          onChange={(e) => update("count", Number(e.target.value))}
        />
      </Field>

      <button
        type="submit"
        disabled={generating}
        className="flex h-[50px] items-center justify-center rounded-[14px] bg-mint text-sm font-black text-white transition-colors hover:bg-mint-dark disabled:opacity-60"
      >
        {generating ? "생성 중…" : `문항 ${cond.count}개 생성하기`}
      </button>
      <p className="text-xs text-[#7f7e88]">약 30초 걸려요 · 실패하면 자동 재시도 1번</p>
      <button
        type="button"
        className="flex h-[46px] items-center justify-center rounded-[14px] bg-muted text-sm font-bold text-mint-dark transition-colors hover:bg-mint-tint"
      >
        + 직접 문항 추가
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
