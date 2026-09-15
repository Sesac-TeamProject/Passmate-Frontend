import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
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
export function MobileActionBar({ children, className }: Props) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-30 mt-auto flex flex-col gap-2.5 bg-card px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}
