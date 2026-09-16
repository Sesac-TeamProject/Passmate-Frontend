import type { ReactNode } from "react";
import { MobileTopBar } from "@/components/common/mobile-top-bar";
import { cn } from "@/lib/utils";

type Props = {
  /** "마이페이지 › " 뒤에 붙는 화면명. 예: "계정 정보 변경" */
  title: string;
  children: ReactNode;
  /** 카드 클래스 덮어쓰기 (완료 화면은 py-12 · items-center 등) */
  cardClassName?: string;
  /** 폰 폭 "←"가 갈 곳. 앱은 마이 하위 화면에서 마이로 돌아간다 */
  backHref?: string;
  /**
   * 폰 폭 하단 버튼 줄(`MobileActionBar`) — 카드 **밖**, `<main>`의 직계 자식으로 그린다.
   * `MobileActionBar`의 `mt-auto`가 바닥에 붙으려면 부모가 `min-h` 있는 flex 컬럼이어야 하는데
   * 그 조건은 `<main>`만 만족한다(카드는 내용만큼만 높이를 가진다) — 그래서 `children`과 분리한 슬롯이다.
   */
  mobileAction?: ReactNode;
};

/**
 * 마이페이지 서브화면 공통 뼈대 (디자인 C-02-1 ~ C-02-12) —
 * main padding [28,36] gap 20 · 제목 heading-lg "마이페이지 › …" · 흰 카드 640px r20 padding 28 gap 16
 *
 * 폰 폭(768px 미만)은 앱 시안 M-12-x — 좌우 20, "← 화면명" 줄(PC의 "마이페이지 › " 접두사는 빼고
 * 화면명만), 카드는 폭을 꽉 채우고 안쪽 여백을 18/16으로 줄인다.
 */
export function MeFormPage({
  title,
  children,
  cardClassName,
  backHref = "/me",
  mobileAction,
}: Props) {
  return (
    // 폰에서 화면 높이를 채워야 아래 버튼 줄(mobileAction)이 바닥에 붙는다 — 탭바 높이를 뺀 만큼이 본문 몫이다
    <main
      className={cn(
        "flex flex-col gap-5 px-9 py-7 max-md:min-h-[calc(100dvh-var(--mobile-tab-bar-h))] max-md:gap-3.5 max-md:px-5 max-md:pt-3",
        // mobileAction이 있으면 그 바가 세이프에어리어 하단 패딩을 스스로 가져 main이 더 줄 필요가 없다 —
        // 그런데도 pb-6을 남기면 버튼 줄과 탭바 사이에 빈 띠가 남는다. 버튼 줄이 없는 화면은 기존대로 pb-6을 유지한다.
        mobileAction ? undefined : "max-md:pb-6",
      )}
    >
      <MobileTopBar title={title} backHref={backHref} className="-mx-5 px-5 pb-1" />
      <h1 className="text-heading-lg text-foreground max-md:hidden">마이페이지 › {title}</h1>
      <section
        className={cn(
          "flex w-[640px] max-w-full flex-col gap-4 rounded-[20px] border bg-card p-7 max-md:w-full max-md:gap-3.5 max-md:px-[18px] max-md:py-4",
          cardClassName,
        )}
      >
        {children}
      </section>
      {mobileAction}
    </main>
  );
}
