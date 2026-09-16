"use client";

import { useId, useState, type ChangeEvent, type SyntheticEvent } from "react";
import { cn } from "@/lib/utils";

export const PIN_LENGTH = 6;

export type PinInputVariant = "home" | "guest";

type Props = {
  value: string;
  onChange: (next: string) => void;
  /** home: 52×64 r14 · 폭 360 space-between (W-01 v6) / guest: 46×56 r12 · gap 8 (C-03 · 앱 M-01) */
  variant?: PinInputVariant;
  disabled?: boolean;
  className?: string;
};

/**
 * 6자리 PIN 입력 — 숨은 input 하나가 값을 갖고 칸 6개는 표시만 한다.
 * 키보드 입력·붙여넣기·백스페이스는 네이티브 input 동작 그대로. 입력 중인 칸은 mint 테두리.
 *
 * guest는 폰 폭(768px 미만)에서 칸이 폭을 나눠 갖는다 — 46×6 + 8×5 = 316이라 390 폰 카드 안쪽(306)부터 넘친다.
 * home도 폰 폭에서는 이 규격(46×56 · flex로 나눠 갖기)을 그대로 물려받는다 — 홈 카드 안쪽은 316이라 여유가 있다.
 */
export function PinInput({ value, onChange, variant = "home", disabled, className }: Props) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const digits = value.slice(0, PIN_LENGTH);
  const activeIndex = focused ? Math.min(digits.length, PIN_LENGTH - 1) : -1;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH));
  };

  /** 캐럿을 항상 끝에 둬서 중간 삽입이 생기지 않게 한다 */
  const moveCaretToEnd = (e: SyntheticEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    const end = el.value.length;
    if (el.selectionStart !== end || el.selectionEnd !== end) el.setSelectionRange(end, end);
  };

  return (
    <div
      className={cn(
        "relative flex w-full",
        variant === "home" ? "justify-between max-md:gap-2" : "gap-2 max-md:gap-1.5",
        className,
      )}
    >
      {Array.from({ length: PIN_LENGTH }, (_, i) => {
        const digit = digits[i];
        const active = i === activeIndex;
        return (
          <span
            key={i}
            aria-hidden
            className={cn(
              "flex shrink-0 items-center justify-center text-heading-lg text-mint-dark",
              variant === "home"
                ? /* 폰 폭은 게스트 칸 규격(56 높이·r12)을 빌리고 flex로 나눠 가지므로 너비 계산이 따로 필요 없다 */
                  "h-16 w-13 rounded-[14px] max-md:h-14 max-md:w-auto max-md:min-w-0 max-md:flex-1 max-md:shrink max-md:rounded-xl"
                : "h-14 w-[46px] rounded-xl max-md:w-auto max-md:min-w-0 max-md:flex-1 max-md:shrink",
              active ? "border-2 border-mint bg-card" : "bg-muted",
            )}
          >
            {digit ?? ""}
          </span>
        );
      })}
      <input
        id={id}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="one-time-code"
        maxLength={PIN_LENGTH}
        aria-label="PIN 6자리"
        value={digits}
        disabled={disabled}
        onChange={handleChange}
        onFocus={(e) => {
          setFocused(true);
          moveCaretToEnd(e);
        }}
        onBlur={() => setFocused(false)}
        onSelect={moveCaretToEnd}
        onClick={moveCaretToEnd}
        className="absolute inset-0 size-full cursor-text caret-transparent opacity-0 outline-none disabled:cursor-not-allowed"
      />
    </div>
  );
}
