import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** 시트 제목 요소의 id — 화면 읽기 프로그램이 대화상자 이름으로 읽는다 */
  labelledBy?: string;
};

/**
 * 모바일(768px 미만) 바텀시트 — 앱 시안 M-06a 별점 시트.
 * 아래에 깔린 화면을 어둡게 덮고, 시트는 아래에서 올라와 내용이 길면 안에서 스크롤된다.
 *
 * md 이상에서는 **감싸지 않는다**(`md:contents`) — 내용이 원래 자리에 그대로 흐르므로
 * PC 화면은 이 부품이 없던 때와 똑같이 그려진다.
 */
export function BottomSheet({ children, labelledBy }: Props) {
  return (
    <>
      <div aria-hidden className="fixed inset-0 z-40 bg-ink/45 md:hidden" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-card px-5 pt-2.5 pb-[max(1.75rem,env(safe-area-inset-bottom))] md:contents"
      >
        <div aria-hidden className="flex h-5 items-center justify-center md:hidden">
          <span className="h-1 w-10 rounded-full bg-ink/20" />
        </div>
        {children}
      </div>
    </>
  );
}
