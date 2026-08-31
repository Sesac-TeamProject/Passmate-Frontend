"use client";

import type { KeyboardEvent } from "react";
import {
  AVATAR_KEYS,
  AVATAR_LABEL,
  StudentAvatar,
  type AvatarKey,
} from "@/components/common/student-avatar";
import { Button } from "@/components/ui/button";
import { MeFormPage } from "@/features/me/settings/me-form-page";
import { cn } from "@/lib/utils";

type Props = {
  selected: AvatarKey;
  onSelect: (avatar: AvatarKey) => void;
  onSubmit: () => void;
  pending?: boolean;
  errorMessage?: string | null;
};

/** C-02-7 내 캐릭터 변경 — 아바타 12종 6×2 라디오 그리드 · "선택: 여우" · 저장하기. 렌더 전용 */
export function CharacterPage({
  selected,
  onSelect,
  onSubmit,
  pending = false,
  errorMessage,
}: Props) {
  /* 라디오 그룹 키보드 이동 — ←/→ 이전·다음, ↑/↓ 한 줄(6칸) 위·아래 */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 6, ArrowUp: -6 }[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const index = AVATAR_KEYS.indexOf(selected);
    const next = AVATAR_KEYS[(index + step + AVATAR_KEYS.length) % AVATAR_KEYS.length];
    onSelect(next);
    event.currentTarget.querySelector<HTMLButtonElement>(`[data-avatar="${next}"]`)?.focus();
  };

  return (
    <MeFormPage title="내 캐릭터 변경">
      {errorMessage && (
        <p
          role="alert"
          className="rounded-xl bg-destructive-soft px-3.5 py-3 text-label-md text-destructive"
        >
          {errorMessage}
        </p>
      )}
      <p className="text-body-md text-muted-foreground">
        대기실 · 결과 화면에서 닉네임과 함께 보여요
      </p>

      <div
        role="radiogroup"
        aria-label="프로필 캐릭터"
        className="grid grid-cols-6 gap-3"
        onKeyDown={handleKeyDown}
      >
        {AVATAR_KEYS.map((key) => {
          const active = key === selected;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={AVATAR_LABEL[key]}
              data-avatar={key}
              tabIndex={active ? 0 : -1}
              onClick={() => onSelect(key)}
              disabled={pending}
              className={cn(
                "flex aspect-square items-center justify-center rounded-2xl border bg-card outline-none focus-visible:ring-2 focus-visible:ring-mint",
                active && "border-2 border-mint bg-mint-bg",
              )}
            >
              <StudentAvatar avatar={key} size={64} />
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-label-md text-mint-dark">선택: {AVATAR_LABEL[selected]}</span>
        <Button type="button" size="xl" onClick={onSubmit} disabled={pending}>
          저장하기
        </Button>
      </div>
    </MeFormPage>
  );
}
