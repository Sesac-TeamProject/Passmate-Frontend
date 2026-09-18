import { useId, type FormEvent, type ReactNode } from "react";
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
  /** home: W-01 v6 PIN 입장 카드(gap 12 · 아바타 40 · 닉네임 52) / guest: C-03 게스트 입장 카드(gap 20 · 아바타 36) */
  variant?: PinInputVariant;
  pending?: boolean;
  /** PIN 칸 바로 아래 한 줄(앱 "PIN 오류 (M-01)"). 없으면 자리를 두지 않는다 */
  pinMessage?: ReactNode;
  /** 닉네임 칸 바로 아래(앱 "닉네임 중복 (M-01)" 대체 후보). 없으면 자리를 두지 않는다 */
  nicknameMessage?: ReactNode;
  className?: string;
};

/** PIN 6칸 · 닉네임 · 내 캐릭터 · 입장하기 — 홈 PIN 카드와 /join 게스트 입장이 공유하는 폼 (렌더 전용) */
export function JoinForm({
  values,
  onChange,
  onSubmit,
  variant = "home",
  pending = false,
  pinMessage = null,
  nicknameMessage = null,
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
      className={cn("flex w-full flex-col", variant === "home" ? "gap-3" : "gap-5", className)}
    >
      <PinInput
        value={values.pin}
        onChange={(pin) => onChange({ ...values, pin })}
        variant={variant}
        disabled={pending}
      />
      {pinMessage}

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
          /* 홈 PIN 카드와 폰 폭 게스트 입장(앱 M-01)은 시안이 52 — 공통 폼 규격(h48)은 그대로 둔다 */
          className={variant === "home" ? "h-[52px]" : "max-md:h-[52px] max-md:rounded-[14px]"}
        />
      </FormField>
      {nicknameMessage}

      <div className="flex flex-col gap-2">
        <span className="text-label-lg text-foreground">내 캐릭터</span>
        <AvatarPicker
          value={values.avatar}
          onChange={(avatar) => onChange({ ...values, avatar })}
          size={variant === "home" ? 40 : 36}
          disabled={pending}
          className={
            variant === "home"
              ? /* 데스크톱은 시안 간격이 가로 18·세로 10, 바깥 3은 선택 링 자리 — 3+44×6+18×5+3 = 360×104
                   폰 폭은 게스트 카드의 간격(가로 8·바깥 2)을 그대로 빌린다 — 44×6+8×5+2×2 = 308, 홈 카드 안쪽(316)에 들어간다 */
                "gap-x-[18px] gap-y-2.5 p-[3px] max-md:justify-items-start max-md:gap-x-2 max-md:p-0.5"
              : /* 폰 폭 카드 안쪽은 306 — 40×6에 간격 16을 두면 320으로 넘친다(앱 M-01은 간격 8) */
                "max-md:justify-items-start max-md:gap-x-2 max-md:p-0.5"
          }
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
