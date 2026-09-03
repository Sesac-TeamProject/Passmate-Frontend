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

/** 홈 PIN 입장 카드 (W-01 v6) — r20 · 내부 폭 360 가운데 · padding [24,40] · gap 12. 시안값 그대로 (높이 512) */
export function PinEntryCard({
  values,
  onChange,
  onSubmit,
  pending,
  errorMessage = null,
  loginHref = null,
}: Props) {
  return (
    <section className="flex w-full flex-col items-center gap-3 rounded-[20px] border bg-card px-10 py-6">
      <h2 className="text-center text-heading-lg text-ink">PIN으로 입장</h2>
      <p className="text-center text-body-md text-muted-foreground">
        선생님이 알려준 6자리 PIN을 입력하면 바로 방에 들어가요
      </p>

      {errorMessage && (
        <div
          role="alert"
          className="flex w-[360px] flex-col items-start gap-1.5 rounded-xl bg-destructive-soft px-3.5 py-3 text-label-md text-destructive"
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
        variant="home"
        values={values}
        onChange={onChange}
        onSubmit={onSubmit}
        pending={pending}
        className="w-[360px]"
      />
    </section>
  );
}
