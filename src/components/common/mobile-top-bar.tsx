import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/** 제목 크기 — md: 화면 제목(M-06 "리포트" 20) / sm: 상태 화면의 화면 이름(M-05e "최종 결과" 15) */
const TITLE_CLASS = {
  md: "text-heading-md",
  sm: "text-label-lg font-bold",
} as const;

type Props = {
  title: ReactNode;
  /** 뒤로 갈 주소. `onBack`과 둘 중 하나만 준다 — 둘 다 없으면 화살표를 그리지 않는다 */
  backHref?: string;
  onBack?: () => void;
  /** 오른쪽 끝 한 자리(예: "문항 3 / 8") */
  trailing?: ReactNode;
  size?: keyof typeof TITLE_CLASS;
  className?: string;
};

/**
 * 모바일(768px 미만) 상단 줄 — 앱 시안 M-06 · M-11 · M-05e의 "← 제목".
 * 웹은 이 자리를 공용 헤더·"‹ 돌아가기" 링크가 맡으므로 **md 이상에서는 그리지 않는다.**
 */
export function MobileTopBar({ title, backHref, onBack, trailing, size = "md", className }: Props) {
  const arrow = (
    <ArrowLeft
      className={size === "md" ? "size-6 text-ink" : "size-[22px] text-ink"}
      strokeWidth={2}
      aria-hidden
    />
  );

  return (
    <div className={cn("flex min-h-6 items-center gap-2.5 md:hidden", className)}>
      {backHref !== undefined ? (
        <Link href={backHref} aria-label="뒤로" className="-m-1 p-1">
          {arrow}
        </Link>
      ) : onBack !== undefined ? (
        <button type="button" onClick={onBack} aria-label="뒤로" className="-m-1 p-1">
          {arrow}
        </button>
      ) : null}
      <span className={cn("min-w-0 flex-1 truncate text-ink", TITLE_CLASS[size])}>{title}</span>
      {trailing}
    </div>
  );
}
