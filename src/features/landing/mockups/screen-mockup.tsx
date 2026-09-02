import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** 실제 화면(1440×900)을 시안 목업 크기(508×317.5)로 줄이는 배율 */
export const SCREEN = { width: 1440, height: 900, scale: 508 / 1440 } as const;

type Props = {
  /** 스크린리더용 설명 — 안쪽 화면은 inert라 읽히지 않는다 */
  label: string;
  children: ReactNode;
  className?: string;
};

/**
 * 랜딩 기능 섹션의 화면 목업 틀. 실제 화면 컴포넌트를 1440×900으로 렌더한 뒤 CSS zoom으로 축소해
 * 시안(frame 508×320 · r14 · 그림자)과 같은 크기로 보여준다. 안쪽은 inert — 클릭·포커스 불가.
 * 시안에서는 이 틀이 그라데이션 카드(ShotCard) 안에 놓인다.
 */
export function ScreenMockup({ label, children, className }: Props) {
  return (
    <figure
      role="img"
      aria-label={label}
      className={cn(
        "relative shrink-0 overflow-hidden rounded-[14px] bg-card shadow-[0_12px_24px] shadow-black/20",
        className,
      )}
      style={{ width: 508, height: 320 }}
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

/**
 * 시안 `shot` — 화면 목업을 감싸는 그라데이션 카드(620×400). 오른쪽 위에 흰 블롭이 하나 뜬다.
 * `gradient`는 시안 3장이 서로 다른 초록을 써서 기능마다 다르게 받는다.
 */
export function ShotCard({ gradient, children }: { gradient: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "relative flex h-[400px] w-[620px] shrink-0 items-center justify-center overflow-hidden rounded-[28px] bg-linear-to-b",
        gradient,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-20 left-[380px] size-[340px] rounded-full bg-[radial-gradient(circle,var(--color-white)_0%,transparent_70%)] opacity-20"
      />
      {children}
    </div>
  );
}
