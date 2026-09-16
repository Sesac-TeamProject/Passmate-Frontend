import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * 폰 폭 버튼 규격 — 앱 시안이 화면마다 같은 크기를 쓴다. 화면마다 따로 적으면 규격이 바뀔 때
 * 네 파일을 고쳐야 하고, 손으로 적은 `<button>`은 공용 버튼의 포커스 표시를 잃는다.
 */
/** 주 버튼: 높이 54 · r16 · 민트 (M-01 입장하기 · M-03 제출하기 · M-05 내 리포트 보기) */
export const MOBILE_PRIMARY_BUTTON =
  "flex h-[54px] w-full items-center justify-center rounded-2xl bg-mint text-heading-sm text-white transition-colors outline-none hover:bg-mint-dark focus-visible:ring-2 focus-visible:ring-mint-dark disabled:opacity-50";
/** 보조 버튼: 높이 50 · r16 · 테두리 (M-05 가입하고 이 기록 저장하기) */
export const MOBILE_SECONDARY_BUTTON =
  "flex h-[50px] w-full items-center justify-center rounded-2xl border bg-card text-label-lg text-mint-dark transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-mint-dark";
/** 바텀시트 버튼: 높이 52 · r16 (M-06a 평가 보내기) — 공용 Button에 덧입힌다 */
export const MOBILE_SHEET_BUTTON = "h-[52px] w-full rounded-2xl text-heading-sm";
/** 상태 화면 버튼: 높이 52 · r14 (M-05e · M-11e 다시 시도 · 홈으로) — 공용 Button에 덧입힌다 */
export const MOBILE_STATE_BUTTON = "h-[52px] rounded-[14px]";

type Props = {
  children: ReactNode;
  /**
   * 하단 탭바가 서는 화면(회원 셸 안)에서 true. 탭바 높이만큼 위로 올려 버튼이 탭 뒤로 들어가지 않게 한다.
   * 탭바가 없는 화면(학생 흐름·mobileBare)은 기본값 그대로 바닥에 붙는다.
   */
  aboveTabBar?: boolean;
  className?: string;
};

/**
 * 모바일(768px 미만) 아래 버튼 바 — 앱 시안 M-03 제출 · M-05 결과 버튼 · 상태 화면 버튼.
 *
 * `fixed`가 아니라 `sticky bottom-0 + mt-auto`다. 부모가 `min-h-dvh flex-col`이면 내용이 짧을 때는
 * 화면 맨 아래에 붙고, 길 때는 스크롤을 따라 바닥에 머문다 — 고정 바가 본문 끝을 가리지 않아
 * 빈 자리(spacer)를 따로 둘 필요가 없다. 홈 표시줄이 있는 폰은 그만큼 더 띄운다.
 *
 * PC는 버튼이 본문 안 제자리에 있으므로 **md 이상에서는 그리지 않는다.**
 */
export function MobileActionBar({ children, aboveTabBar = false, className }: Props) {
  return (
    <div
      className={cn(
        "sticky z-30 mt-auto flex flex-col gap-2.5 bg-card px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:hidden",
        aboveTabBar ? "bottom-[var(--mobile-tab-bar-h)] pb-3" : "bottom-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
