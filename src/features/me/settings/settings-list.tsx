import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ListProps = { children: ReactNode; className?: string };

/** 테두리 있는 목록 컨테이너 (r16 · 행 사이 1px). 결제 수단·코인 내역·알림 설정 */
export function SettingsList({ children, className }: ListProps) {
  return (
    <div className={cn("flex flex-col divide-y rounded-2xl border bg-card", className)}>
      {children}
    </div>
  );
}

type RowProps = {
  /** 제목 앞 아이콘 슬롯 (코인 원 등) */
  leading?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** 우측 액션 — 링크 텍스트·작은 버튼·토글 */
  action?: ReactNode;
  className?: string;
};

/**
 * 설정 행 — 좌 [제목 label-lg ink / 설명 label-md 회색] · 우 액션.
 * 컨테이너에 따라 padding이 다르다: SettingsList 안은 px-5 py-4, C-02 v3 카드 안은 py-3.5 (className으로 지정)
 */
export function SettingsRow({ leading, title, description, action, className }: RowProps) {
  return (
    <div className={cn("flex items-center gap-3 px-5 py-4", className)}>
      {leading}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-label-lg text-foreground">{title}</span>
        {description && <span className="text-label-md text-muted-foreground">{description}</span>}
      </div>
      {action}
    </div>
  );
}
