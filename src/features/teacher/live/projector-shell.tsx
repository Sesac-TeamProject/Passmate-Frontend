import type { ReactNode } from "react";
import { Mascot } from "@/components/common/mascot";

type Props = {
  /** 상단 바 내용 (없으면 렌더하지 않음) */
  top?: ReactNode;
  children: ReactNode;
  /** 하단 바 내용 */
  bottom: ReactNode;
  /** 좌하단 마스코트 표시 */
  mascot?: boolean;
};

/** 프로젝터 화면(W-04~W-06 모각작 스타일) 공통 뼈대: 상단 바 · 본문 · 하단 액션 바 · 마스코트 */
export function ProjectorShell({ top, children, bottom, mascot = false }: Props) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {top}
      <div className="flex flex-1 flex-col items-center">{children}</div>
      <footer className="flex items-center justify-between border-t bg-card px-10 py-5">
        {bottom}
      </footer>
      {mascot && <Mascot className="absolute bottom-[140px] left-16" />}
    </div>
  );
}
