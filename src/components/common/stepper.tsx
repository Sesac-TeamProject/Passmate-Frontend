"use client";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  value: number;
  onChange: (next: number) => void;
  min: number;
  max: number;
  /** 한 번 누를 때 움직이는 폭 */
  step: number;
  /** 값 옆에 붙이는 단위 (예: "초") */
  unit?: string;
  label: string;
  /** 읽기 전용 화면에서 −/+ 를 함께 잠근다 */
  disabled?: boolean;
};

/** −/값/+ 스테퍼. W-02b 문항별 제한 시간이 처음 쓴다 */
export function Stepper({ value, onChange, min, max, step, unit, label, disabled }: Props) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  return (
    <div
      role="group"
      aria-label={label}
      aria-disabled={disabled || undefined}
      className={cn(
        "flex h-10 w-[150px] items-center justify-between rounded-xl border-[1.5px] px-1",
        // 잠긴 스테퍼가 "값이 한계에 닿은 스테퍼"처럼 보이면 안 된다 — 판 전체를 죽인다
        disabled && "bg-muted/40 text-muted-foreground opacity-70",
      )}
    >
      <button
        type="button"
        onClick={() => onChange(clamp(value - step))}
        disabled={disabled || value <= min}
        aria-label={`${label} ${step}${unit ?? ""} 줄이기`}
        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <Minus className="size-4" />
      </button>
      <span aria-live="polite" className="text-label-lg font-bold">
        {value}
        {unit}
      </span>
      <button
        type="button"
        onClick={() => onChange(clamp(value + step))}
        disabled={disabled || value >= max}
        aria-label={`${label} ${step}${unit ?? ""} 늘리기`}
        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
