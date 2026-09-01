import { BrandLogo } from "@/components/common/brand-logo";

/**
 * C-01a 로그인 처리 중 (design.pen "01 · 웹" 프레임 fBnsA).
 *
 * 소셜 로그인 콜백이 토큰을 교환하는 동안 보인다. 결과 화면의 구조를 모르고 한 동작만
 * 기다리므로 07 보드 규칙대로 스켈레톤이 아니라 스피너를 쓴다.
 */
export function LoginProgress() {
  return (
    <main
      role="status"
      aria-live="polite"
      aria-busy
      className="flex flex-1 flex-col items-center justify-center gap-6 px-5"
    >
      <div className="flex w-full max-w-[420px] flex-col items-center gap-4 rounded-[20px] border bg-card px-8 pt-10 pb-9">
        <BrandLogo href="#" className="pointer-events-none" />

        <span
          aria-hidden
          className="mt-2 size-14 animate-spin rounded-full border-[5px] border-mint-bg border-t-mint"
        />

        <h1 className="mt-2 text-heading-lg text-ink">로그인 중이에요</h1>
        <p className="text-center text-body-lg text-muted-foreground">
          구글 계정을 확인하고 있어요. 잠시만요.
        </p>
        <p className="text-label-lg text-ink-disabled">보통 3초 안에 끝나요</p>
      </div>

      <p className="text-body-lg text-muted-foreground">10초가 넘게 걸리면 새로고침해 주세요</p>
    </main>
  );
}
