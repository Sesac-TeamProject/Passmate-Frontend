import Link from "next/link";
import { BrandLogo } from "@/components/common/brand-logo";
import { JoinForm, type JoinValues } from "./join-form";

type Props = {
  values: JoinValues;
  onChange: (next: JoinValues) => void;
  onSubmit: () => void;
  pending?: boolean;
  /** PIN 조회·입장 실패 문구 (유료 방 로그인 안내 포함) */
  errorMessage?: string | null;
  /** errorMessage가 유료 방 안내일 때만: "로그인하기" 버튼이 가리킬 경로(/login?next=/pay/{pin}) */
  loginHref?: string | null;
};

/** C-03 게스트 입장 (웹) — PIN · 닉네임 · 캐릭터 한 카드. 렌더 전용, 상태는 app/(bare)/join/page.tsx가 소유 */
export function JoinPage({
  values,
  onChange,
  onSubmit,
  pending = false,
  errorMessage = null,
  loginHref = null,
}: Props) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background">
      <BrandLogo size="lg" />

      <section className="flex w-[380px] flex-col gap-5 rounded-3xl border bg-card px-[22px] py-[26px]">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-heading-md text-ink">PIN으로 입장하기</h1>
          <p className="text-body-md text-muted-foreground">
            선생님 화면의 6자리 숫자를 입력하세요
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="flex flex-col items-start gap-1.5 rounded-xl bg-destructive-soft px-3.5 py-3 text-label-md text-destructive"
          >
            <p>{errorMessage}</p>
            {loginHref && (
              <Link href={loginHref} className="text-label-md font-semibold underline">
                로그인하기 →
              </Link>
            )}
          </div>
        )}

        <JoinForm
          variant="guest"
          values={values}
          onChange={onChange}
          onSubmit={onSubmit}
          pending={pending}
        />
      </section>

      <p className="flex items-center gap-1">
        <span className="text-body-md text-muted-foreground">기록을 남기고 싶다면</span>
        <Link href="/login" className="text-label-lg text-mint">
          로그인 →
        </Link>
      </p>
    </main>
  );
}
