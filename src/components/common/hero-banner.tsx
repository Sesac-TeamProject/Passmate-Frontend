import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description: string;
  /** 우측 액션(버튼·링크). 없으면 제목만 */
  action?: ReactNode;
  className?: string;
};

/**
 * 민트 배경 페이지 배너 (디자인 W-01 v6 홈·W-10 정산 공통). r24 · padding [26,32] — 시안값 그대로 (높이 107, md 이상).
 * 폰 폭(max-md)은 앱에 같은 배너가 없어 제목·설명·액션이 겹치지 않게만 재배치한다 — 좌우 여백을 페이지 거터(20px)에 맞추고
 * 액션이 있으면 가로로 다투지 않도록 텍스트 아래로 내린다(줄바꿈만 허용, 잘림 없음).
 */
export function HeroBanner({ title, description, action, className }: Props) {
  return (
    <section
      className={cn(
        "flex items-center justify-between rounded-3xl bg-mint-bg px-8 py-[26px]",
        "max-md:flex-col max-md:items-start max-md:justify-start max-md:gap-4 max-md:px-5",
        className,
      )}
    >
      <div className="flex flex-col gap-1.5">
        <h1 className="text-heading-lg text-mint-ink">{title}</h1>
        <p className="text-label-lg text-mint-ink-secondary">{description}</p>
      </div>
      {action}
    </section>
  );
}
