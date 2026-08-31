import Link from "next/link";
import type { FormEvent } from "react";
import { FieldInput, FormField } from "@/components/common/form-field";
import { StudentAvatar, type AvatarKey } from "@/components/common/student-avatar";
import { Button } from "@/components/ui/button";
import { MeFormPage } from "@/features/me/settings/me-form-page";

export type AccountValues = { nickname: string };

type Props = {
  avatar: AvatarKey;
  /** 로그인 ID — 읽기 전용 */
  email: string;
  values: AccountValues;
  onChange: (next: AccountValues) => void;
  onSubmit: () => void;
  pending?: boolean;
  errorMessage?: string | null;
};

/** C-02-1 계정 정보 변경 — 아바타 행 · 닉네임 · 이메일(읽기 전용) · 저장하기. 렌더 전용 */
export function AccountPage({
  avatar,
  email,
  values,
  onChange,
  onSubmit,
  pending = false,
  errorMessage,
}: Props) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <MeFormPage title="계정 정보 변경">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {errorMessage && (
          <p
            role="alert"
            className="rounded-xl bg-destructive-soft px-3.5 py-3 text-label-md text-destructive"
          >
            {errorMessage}
          </p>
        )}
        <div className="flex items-center gap-3.5">
          <StudentAvatar avatar={avatar} size={72} />
          <div className="flex flex-col gap-0.5">
            <span className="text-label-lg text-ink">프로필 캐릭터</span>
            <Link href="/me/character" className="text-label-md text-mint">
              캐릭터 바꾸기 →
            </Link>
          </div>
        </div>

        <FormField label="닉네임" htmlFor="account-nickname">
          <FieldInput
            id="account-nickname"
            name="nickname"
            autoComplete="nickname"
            value={values.nickname}
            onChange={(e) => onChange({ ...values, nickname: e.target.value })}
            disabled={pending}
          />
        </FormField>

        <FormField label="이메일" htmlFor="account-email">
          <FieldInput
            id="account-email"
            type="email"
            name="email"
            value={email}
            readOnly
            aria-readonly
          />
        </FormField>

        <p className="text-label-md text-muted-foreground">
          이메일은 로그인 ID라 바꿀 수 없어요. 닉네임은 방 안에서 학생·선생님에게 보여요.
        </p>

        <div className="flex justify-end">
          <Button type="submit" size="xl" disabled={pending}>
            저장하기
          </Button>
        </div>
      </form>
    </MeFormPage>
  );
}
