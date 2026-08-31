import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** 실제 화면(1440×900)을 시안 목업 크기(691×432)로 줄이는 배율 */
export const SCREEN = { width: 1440, height: 900, scale: 0.48 } as const;

type Props = {
  /** 스크린리더용 설명 — 안쪽 화면은 inert라 읽히지 않는다 */
  label: string;
  children: ReactNode;
  className?: string;
};

/**
 * 랜딩 기능 섹션의 화면 목업 틀. 실제 화면 컴포넌트를 1440×900으로 렌더한 뒤 CSS zoom으로 축소해
 * 시안(shot-wrap 691×432 · r20 · 1px 선 · 그림자)과 같은 크기로 보여준다. 안쪽은 inert — 클릭·포커스 불가.
 */
export function ScreenMockup({ label, children, className }: Props) {
  return (
    <figure
      role="img"
      aria-label={label}
      className={cn(
        "relative shrink-0 overflow-hidden rounded-[20px] border bg-card shadow-[0_16px_35px] shadow-ink/12",
        className,
      )}
      style={{ width: SCREEN.width * SCREEN.scale, height: SCREEN.height * SCREEN.scale }}
    >
      <div
        inert
        className="pointer-events-none overflow-hidden select-none"
        style={{ zoom: SCREEN.scale, width: SCREEN.width, height: SCREEN.height }}
      >
        {children}
      </div>
    </figure>
  );
}
