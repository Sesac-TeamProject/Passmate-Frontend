import type { FormEvent } from "react";
import { FieldInput, FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { MeFormPage } from "@/features/me/settings/me-form-page";

export type PasswordValues = { current: string; next: string; confirm: string };

type Props = {
  values: PasswordValues;
  onChange: (next: PasswordValues) => void;
  onSubmit: () => void;
  pending?: boolean;
};

/** C-02-2 비밀번호 변경 — 현재 · 새 비밀번호 · 확인 · 변경하기. 렌더 전용 */
export function PasswordPage({ values, onChange, onSubmit, pending = false }: Props) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <MeFormPage title="비밀번호 변경">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label="현재 비밀번호" htmlFor="password-current">
          <FieldInput
            id="password-current"
            type="password"
            name="current-password"
            autoComplete="current-password"
            value={values.current}
            onChange={(e) => onChange({ ...values, current: e.target.value })}
            disabled={pending}
          />
        </FormField>

        <FormField label="새 비밀번호" htmlFor="password-next">
          <FieldInput
            id="password-next"
            type="password"
            name="new-password"
            autoComplete="new-password"
            placeholder="8자 이상, 영문 + 숫자"
            value={values.next}
            onChange={(e) => onChange({ ...values, next: e.target.value })}
            disabled={pending}
          />
        </FormField>

        <FormField label="새 비밀번호 확인" htmlFor="password-confirm">
          <FieldInput
            id="password-confirm"
            type="password"
            name="confirm-password"
            autoComplete="new-password"
            placeholder="한 번 더 입력"
            value={values.confirm}
            onChange={(e) => onChange({ ...values, confirm: e.target.value })}
            disabled={pending}
          />
        </FormField>

        <p className="text-label-md text-muted-foreground">
          변경하면 다른 기기에서는 다시 로그인해야 해요.
        </p>

        <div className="flex justify-end">
          <Button type="submit" size="xl" disabled={pending}>
            변경하기
          </Button>
        </div>
      </form>
    </MeFormPage>
  );
}
