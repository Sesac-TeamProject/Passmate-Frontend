import type { ReactNode } from "react";
import { Mascot } from "@/components/common/mascot";
import { cn } from "@/lib/utils";

/**
 * 프로젝터 화면 톤.
 * - neutral: 회색 배경, 흰 하단 바 + 위 테두리 (W-06 모각작 스타일)
 * - mint: 민트 배경, 하단 바도 민트·테두리 없음 (W-04/W-05 기본형)
 */
export type ProjectorTone = "neutral" | "mint";

type Props = {
  /** 상단 바 내용 (없으면 렌더하지 않음) */
  top?: ReactNode;
  children: ReactNode;
  /** 하단 바 내용 */
  bottom: ReactNode;
  /** 하단 바 추가 클래스 (패딩 등 화면별 차이) */
  bottomClassName?: string;
  /** 좌하단 마스코트 표시 */
  mascot?: boolean;
  tone?: ProjectorTone;
};

const TONE = {
  neutral: { page: "bg-background", bottom: "border-t bg-card" },
  mint: { page: "bg-mint-bg", bottom: "bg-mint-bg" },
} as const satisfies Record<ProjectorTone, { page: string; bottom: string }>;

/** 프로젝터 화면(W-04~W-06) 공통 뼈대: 상단 바 · 본문 · 하단 액션 바 · 마스코트 */
export function ProjectorShell({
  top,
  children,
  bottom,
  bottomClassName,
  mascot = false,
  tone = "neutral",
}: Props) {
  return (
    <div className={cn("relative flex min-h-screen flex-col", TONE[tone].page)}>
      {top}
      <div className="flex flex-1 flex-col items-center">{children}</div>
      <footer
        className={cn(
          "flex items-center justify-between px-10 py-5",
          TONE[tone].bottom,
          bottomClassName,
        )}
      >
        {bottom}
      </footer>
      {mascot && <Mascot className="absolute bottom-[140px] left-16" />}
    </div>
  );
}
