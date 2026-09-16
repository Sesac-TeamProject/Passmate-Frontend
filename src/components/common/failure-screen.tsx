import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { MobileActionBar } from "@/components/common/mobile-action-bar";
import { MobileTopBar } from "@/components/common/mobile-top-bar";
import { cn } from "@/lib/utils";

type Note = {
  title: string;
  detail?: string;
  /**
   * mint: 잃은 게 없다고 안심시키는 정보 (W-02e "입력한 설정은 그대로 남아 있어요")
   * plain: 사실만 나열하는 정보 (W-11e 결제 금액·수단)
   */
  tone?: "mint" | "plain";
};

/** 폰 폭 상단 줄 — 앱 상태 화면(M-05e · M-11e)의 "← 화면 이름" */
type MobileHeader = {
  title: string;
  backHref?: string;
  onBack?: () => void;
};

type Props = {
  /**
   * 화면 위 상단바. 사이드바가 없는 흐름(방 만들기 등)에서만 넘긴다 —
   * 사이드바 안쪽 화면에 또 그리면 브랜드가 두 번 나온다.
   */
  header?: ReactNode;
  /** 폰 폭에서만 보이는 "← 화면 이름" 줄. 없으면 그리지 않는다 */
  mobileHeader?: MobileHeader;
  title: string;
  description: ReactNode;
  note?: Note;
  /** 되돌아갈 길. 04 보드 B 규칙 — 실패 화면에는 반드시 다음 행동이 있어야 한다 */
  actions: ReactNode;
  /** 카드 밖 아래 한 줄. 지금 당장 누를 것은 아니지만 알아야 하는 사실 */
  footnote?: string;
};

/**
 * 작업 실패 화면의 공통 뼈대 (design.pen "04 · 상태 · 오류 — 웹" 규칙 카드 B).
 *
 * W-02e 방 생성 실패 · W-11e 결제 실패 · E-401 세션 만료 · E-500 점검 중이 같은 골격을 쓴다.
 * 시안이 넷을 한 규칙으로 묶어 놨으므로 문구만 갈아 끼우게 한 곳에 둔다.
 *
 * 폰 폭(768px 미만)은 앱 시안 "05 · 상태 · 오류 — 앱"(M-05e · M-11e)을 따른다 — 카드 테두리 없이
 * 경고 아이콘 원 · 가운데 제목·안내 · **버튼은 화면 아래**. PC 배치는 그대로다.
 *
 * 문구는 04 보드 세 줄 규칙을 따른다 — 무엇이 잘못됐는지 → 지금 뭘 하면 되는지 → 끝.
 * 사과·오류코드·전문용어를 넣지 않는다.
 */
export function FailureScreen({
  header,
  mobileHeader,
  title,
  description,
  note,
  actions,
  footnote,
}: Props) {
  return (
    <main role="alert" className="flex flex-1 flex-col max-md:min-h-dvh max-md:bg-card">
      {header}

      {mobileHeader ? (
        <MobileTopBar
          title={mobileHeader.title}
          backHref={mobileHeader.backHref}
          onBack={mobileHeader.onBack}
          size="sm"
          className="px-5 pt-11"
        />
      ) : null}

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-5 pb-24 max-md:gap-4 max-md:pb-8">
        <div className="flex w-full max-w-[520px] flex-col items-center gap-3 rounded-[20px] border bg-card px-10 py-9 max-md:border-0 max-md:px-0 max-md:py-0">
          <span
            aria-hidden
            className="mb-3 flex size-16 items-center justify-center rounded-full bg-negative-bg md:hidden"
          >
            <AlertCircle className="size-[30px] text-choice-a-foreground" strokeWidth={2} />
          </span>

          <h1 className="text-center text-display-md text-ink max-md:text-heading-lg">{title}</h1>
          <p className="text-center text-body-lg leading-relaxed text-muted-foreground">
            {description}
          </p>

          {note ? (
            <div
              className={cn(
                "mt-3 flex w-full flex-col gap-1 rounded-xl px-5 py-4",
                note.tone === "plain" ? "bg-muted" : "bg-mint-bg",
              )}
            >
              <p
                className={cn(
                  "text-label-lg",
                  note.tone === "plain" ? "text-ink" : "text-mint-dark",
                )}
              >
                {note.title}
              </p>
              {note.detail ? (
                <p
                  className={cn(
                    "text-label-md",
                    note.tone === "plain" ? "text-muted-foreground" : "text-mint-dark",
                  )}
                >
                  {note.detail}
                </p>
              ) : null}
            </div>
          ) : null}

          {/* PC는 카드 안 한 줄, 폰은 아래 버튼 바에 세로로 — 같은 버튼을 자리만 달리 그린다 */}
          <div className="mt-4 hidden w-full items-center gap-3 md:flex">{actions}</div>
        </div>

        {footnote ? (
          <p className="text-center text-body-lg text-muted-foreground max-md:text-body-md max-md:text-ink-disabled">
            {footnote}
          </p>
        ) : null}
      </div>

      <MobileActionBar className="[&>*]:w-full">{actions}</MobileActionBar>
    </main>
  );
}
