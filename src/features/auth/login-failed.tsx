import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { BrandLogo } from "@/components/common/brand-logo";

type Props = {
  /**
   * 실패 사유. 시안은 "구글 계정 연결이 취소됐어요"라고 단정하지만 그건 인가 코드가 아예
   * 안 돌아온 경우에만 맞다 — 교환이 실패했을 때까지 취소라고 하면 사실이 아니다.
   */
  reason: "canceled" | "failed";
  onRetry: () => void;
};

const DESCRIPTION: Record<Props["reason"], string> = {
  canceled: "구글 계정 연결이 취소됐어요.",
  failed: "구글 계정을 확인하지 못했어요.",
};

/**
 * C-01b 로그인 실패 (design.pen "01 · 웹" 프레임 gIin9).
 * 04 보드 세 줄 규칙 — 무엇이 잘못됐는지 → 지금 뭘 하면 되는지(다시 시도 · 게스트 입장) → 끝.
 */
export function LoginFailed({ reason, onRetry }: Props) {
  return (
    <main role="alert" className="flex flex-1 flex-col items-center justify-center gap-6 px-5">
      <div className="flex w-full max-w-[420px] flex-col items-center gap-4 rounded-[20px] border bg-card px-10 pt-9 pb-8">
        <BrandLogo href="#" className="pointer-events-none" />

        <span
          aria-hidden
          className="mt-2 flex size-16 items-center justify-center rounded-full bg-negative-bg"
        >
          <AlertCircle size={30} className="text-negative-soft-foreground" />
        </span>

        <h1 className="mt-2 text-heading-lg text-ink">로그인하지 못했어요</h1>
        <p className="text-center text-body-lg leading-relaxed text-muted-foreground">
          {DESCRIPTION[reason]}
          <br />
          다시 시도하거나 PIN으로 바로 들어갈 수 있어요.
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-4 flex h-13 w-full items-center justify-center rounded-xl bg-mint text-heading-sm text-white transition-colors hover:bg-mint-dark"
        >
          다시 시도
        </button>
        <Link
          href="/join"
          className="flex h-12 w-full items-center justify-center rounded-xl border text-label-lg text-ink transition-colors hover:bg-muted"
        >
          PIN으로 게스트 입장
        </Link>
      </div>

      {/* TODO(설정): 시안에는 "문제가 계속되면 문의하기 ›"가 있다. 문의 채널·주소가 정해지면 넣는다 —
          지금 넣으면 눌러도 갈 곳이 없다. */}
    </main>
  );
}
