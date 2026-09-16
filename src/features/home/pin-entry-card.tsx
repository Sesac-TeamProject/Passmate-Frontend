import Link from "next/link";
import { JoinForm, type JoinValues } from "@/features/participant/join/join-form";

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

/**
 * 홈 PIN 입장 카드 (W-01 v6) — r20 · 내부 폭 360 가운데 · padding [24,40] · gap 12. 시안값 그대로 (높이 512).
 *
 * 폰 폭(max-md)은 좌우 여백을 줄이고, PIN 6칸이 고정 360폭에서 넘치므로 `/join`의 게스트 폼 규격
 * (`variant="guest"`, `src/features/participant/join/pin-input.tsx`가 이미 폰 폭에 맞춰 둔 칸 크기)을
 * 그대로 빌려 쓴다 — 두 벌을 그려 두고 CSS로만 하나를 보인다(같은 값을 두 번 짓지 않는다).
 */
export function PinEntryCard({
  values,
  onChange,
  onSubmit,
  pending,
  errorMessage = null,
  loginHref = null,
}: Props) {
  return (
    <section className="flex w-full flex-col items-center gap-3 rounded-[20px] border bg-card px-10 py-6 max-md:px-4 max-md:py-5">
      <h2 className="text-center text-heading-lg text-ink">PIN으로 입장</h2>
      <p className="text-center text-body-md text-muted-foreground">
        선생님이 알려준 6자리 PIN을 입력하면 바로 방에 들어가요
      </p>

      {errorMessage && (
        <div
          role="alert"
          className="flex w-[360px] flex-col items-start gap-1.5 rounded-xl bg-destructive-soft px-3.5 py-3 text-label-md text-destructive max-md:w-full"
        >
          <p>{errorMessage}</p>
          {loginHref && (
            <Link href={loginHref} className="text-label-md font-semibold underline">
              로그인하기 →
            </Link>
          )}
        </div>
      )}

      {/* 데스크톱 — 시안 규격(52×64 · 폭 360 고정) */}
      <JoinForm
        variant="home"
        values={values}
        onChange={onChange}
        onSubmit={onSubmit}
        pending={pending}
        className="w-[360px] max-md:hidden"
      />
      {/* 폰 폭 — 게스트 입장과 같은 칸 규격(46×56 → max-md에서 더 좁아짐) */}
      <JoinForm
        variant="guest"
        values={values}
        onChange={onChange}
        onSubmit={onSubmit}
        pending={pending}
        className="hidden w-full max-md:flex"
      />
    </section>
  );
}
