import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * 버튼이 일하는 동안 라벨 앞에 붙는 회전 링
 * (design.pen "07 · 로딩 · 스켈레톤" · pattern/버튼 안 로딩).
 *
 * 시안 규칙: "누른 버튼만 비활성 + 회전 링." 비활성은 각 버튼이 이미 disabled로 하고 있어
 * 빠져 있던 건 링뿐이다. 링은 글자 색을 그대로 물려받아(currentColor) 민트 버튼에서는 흰색,
 * 외곽선 버튼에서는 잉크색으로 돈다.
 *
 * 링만 있고 글자가 없으면 무슨 일이 일어나는지 알 수 없어 라벨을 함께 받는다 —
 * 시안 예시 버튼도 "방 만드는 중…"이라고 적어 둔다.
 */
export function PendingLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        aria-hidden
        className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70"
      />
      {children}
    </span>
  );
}
