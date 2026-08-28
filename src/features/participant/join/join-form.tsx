import { useId, type FormEvent } from "react";
import { FieldInput, FormField } from "@/components/common/form-field";
import type { AvatarKey } from "@/components/common/student-avatar";
import { cn } from "@/lib/utils";
import { AvatarPicker } from "./avatar-picker";
import { PIN_LENGTH, PinInput, type PinInputVariant } from "./pin-input";

export type JoinValues = {
  pin: string;
  nickname: string;
  avatar: AvatarKey;
};

export const INITIAL_JOIN_VALUES: JoinValues = { pin: "", nickname: "", avatar: "cat" };

type Props = {
  values: JoinValues;
  onChange: (next: JoinValues) => void;
  onSubmit: () => void;
  /** home: W-01 v6 PIN 입장 카드(gap 12 · 아바타 40) / guest: C-03 게스트 입장 카드(gap 20 · 아바타 36) */
  variant?: PinInputVariant;
  pending?: boolean;
  className?: string;
};

/** PIN 6칸 · 닉네임 · 내 캐릭터 · 입장하기 — 홈 PIN 카드와 /join 게스트 입장이 공유하는 폼 (렌더 전용) */
export function JoinForm({
  values,
  onChange,
  onSubmit,
  variant = "home",
  pending = false,
  className,
}: Props) {
  const nicknameId = useId();
  const canSubmit = values.pin.length === PIN_LENGTH && values.nickname.trim().length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || pending) return;
    onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex w-full flex-col", variant === "home" ? "gap-2.5" : "gap-5", className)}
    >
      <PinInput
        value={values.pin}
        onChange={(pin) => onChange({ ...values, pin })}
        variant={variant}
        disabled={pending}
      />

      <FormField label="닉네임" htmlFor={nicknameId}>
        <FieldInput
          id={nicknameId}
          type="text"
          name="nickname"
          autoComplete="nickname"
          placeholder="이 방에서 쓸 이름"
          value={values.nickname}
          onChange={(e) => onChange({ ...values, nickname: e.target.value })}
          disabled={pending}
        />
      </FormField>

      <div className="flex flex-col gap-2">
        <span className="text-label-lg text-foreground">내 캐릭터</span>
        <AvatarPicker
          value={values.avatar}
          onChange={(avatar) => onChange({ ...values, avatar })}
          size={variant === "home" ? 40 : 36}
          layout={variant === "home" ? "row" : "grid"}
          disabled={pending}
          className={variant === "home" ? "self-center" : undefined}
        />
        <p className="text-label-md text-muted-foreground">
          대기실·결과 화면에서 이 캐릭터로 보여요 (닉네임과 함께)
        </p>
      </div>

      <button
        type="submit"
        disabled={!canSubmit || pending}
        className="flex h-[54px] w-full items-center justify-center rounded-2xl bg-mint text-heading-sm text-white transition-colors hover:bg-mint-dark disabled:pointer-events-none disabled:opacity-50"
      >
        입장하기
      </button>
    </form>
  );
}
