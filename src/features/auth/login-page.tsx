import Link from "next/link";
import type { FormEvent } from "react";
import { BrandLogo } from "@/components/common/brand-logo";
import { FieldInput, FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export type LoginValues = {
  email: string;
  password: string;
  remember: boolean;
};

type Props = {
  values: LoginValues;
  onChange: (next: LoginValues) => void;
  onSubmit: () => void;
  pending?: boolean;
};

/** C-01 v2 로그인 (웹) — 가운데 카드형. 렌더 전용, 상태는 app/(bare)/login/page.tsx가 소유 */
export function LoginPage({ values, onChange, onSubmit, pending = false }: Props) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background py-16">
      <p className="text-body-md text-muted-foreground">혼자 시작한 공부, 함께하는 합격까지.</p>

      <form
        onSubmit={handleSubmit}
        className="flex w-[420px] flex-col gap-6 rounded-[20px] border bg-card p-10"
      >
        <BrandLogo size="lg" />

        <div className="flex flex-col gap-1.5">
          <h1 className="text-heading-lg text-ink">로그인</h1>
          <p className="text-body-md text-muted-foreground">
            선생님 · 학생 모두 같은 계정으로 시작해요
          </p>
        </div>

        <FormField label="이메일" htmlFor="login-email">
          <FieldInput
            id="login-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="이메일 주소"
            value={values.email}
            onChange={(e) => onChange({ ...values, email: e.target.value })}
            disabled={pending}
          />
        </FormField>

        <FormField label="비밀번호" htmlFor="login-password">
          <FieldInput
            id="login-password"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="비밀번호"
            value={values.password}
            onChange={(e) => onChange({ ...values, password: e.target.value })}
            disabled={pending}
          />
        </FormField>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-body-md text-muted-foreground">
            <Checkbox
              className="size-[18px] rounded-[4px] bg-card"
              checked={values.remember}
              onCheckedChange={(checked) => onChange({ ...values, remember: checked })}
              disabled={pending}
            />
            로그인 유지
          </label>
          {/* TODO: 비밀번호 찾기 라우트 없음 (routes.ts 등록 후 연결) */}
          <Link href="#" className="text-label-lg text-mint">
            비밀번호 찾기
          </Link>
        </div>

        <Button type="submit" size="xl" className="w-full" disabled={pending}>
          로그인
        </Button>

        <div className="flex items-center gap-3">
          <span aria-hidden className="h-px flex-1 bg-border" />
          <span className="text-label-md text-ink-disabled">또는</span>
          <span aria-hidden className="h-px flex-1 bg-border" />
        </div>

        {/* TODO(API): Google OAuth 계약 없음 */}
        <Button
          type="button"
          variant="outline"
          size="xl"
          className="w-full gap-2 bg-card"
          disabled={pending}
        >
          <span aria-hidden className="text-label-lg text-blue">
            G
          </span>
          <span className="text-label-lg text-foreground">Google로 계속하기</span>
        </Button>

        <p className="flex items-center justify-center gap-1">
          <span className="text-body-md text-muted-foreground">계정이 없나요?</span>
          {/* TODO: 회원가입 라우트 없음 (routes.ts 등록 후 연결) */}
          <Link href="#" className="text-label-lg text-mint">
            회원가입
          </Link>
        </p>
      </form>

      <p className="flex items-center gap-1">
        <span className="text-body-md text-muted-foreground">방 코드만 있다면</span>
        <Link href="/join" className="text-label-lg text-mint">
          PIN으로 게스트 입장 →
        </Link>
      </p>
    </main>
  );
}
