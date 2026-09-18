import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  /** 헤더 제목 — 문자열 또는 아이콘+문자열 */
  title: ReactNode;
  /** 헤더 우측 슬롯 (예: "Lv.3부터 유료 방 개설 가능") */
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * C-02 v3 마이페이지 설정 카드 — r16 · border · padding [8,20] · 헤더(padding [12,0,4,0] heading-sm) + 행 사이 1px.
 * 행은 `SettingsRow className="px-0 py-3.5"`를 쓴다.
 */
export function SettingsCard({ title, aside, children, className }: Props) {
  return (
    <section
      className={cn("flex flex-col divide-y rounded-2xl border bg-card px-5 py-2", className)}
    >
      {/* aside(예: "Lv.3부터 유료 방 개설 가능")가 제목과 한 줄에서 좁아지면 둘째 줄로 내린다 */}
      <header className="flex items-center justify-between pt-3 pb-1 max-md:flex-wrap max-md:gap-2 max-md:gap-y-1">
        <h2 className="flex items-center gap-2 text-heading-sm text-ink">{title}</h2>
        {aside}
      </header>
      {children}
    </section>
  );
}
