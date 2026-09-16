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
  className?: string;
};

/**
 * 모바일(768px 미만) 아래 버튼 바 — 앱 시안 M-03 제출 · M-05 결과 버튼 · 상태 화면 버튼.
 *
 * `fixed`가 아니라 `sticky bottom-0 + mt-auto`다. 부모가 `min-h-dvh flex-col`이면 내용이 짧을 때는
 * 화면 맨 아래에 붙고, 길 때는 스크롤을 따라 바닥에 머문다 — 맨 아래까지 내리면 바가 제자리로
 * 돌아와 본문 끝을 가리지 않으므로 빈 자리(spacer)가 필요 없다. 홈 표시줄이 있는 폰은 그만큼 더 띄운다.
 *
 * 다만 **내려가는 도중에는 본문 위를 덮는다.** 바탕이 본문과 같은 흰색이고 경계가 없으면
 * 덮인 카드가 "잘린 것"처럼 보인다(운영 확인, 2026-09-16: 최종 결과 화면 맨 위에서 문항 카드의
 * 87%가 바에 덮였다). 위쪽에 실선 한 줄을 둬서 "가려진 것"으로 읽히게 한다.
 *
 * PC는 버튼이 본문 안 제자리에 있으므로 **md 이상에서는 그리지 않는다.**
 */
export function MobileActionBar({ children, className }: Props) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-30 mt-auto flex flex-col gap-2.5 border-t border-line-soft bg-card px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}
