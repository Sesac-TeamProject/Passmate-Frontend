import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** 시안 v6 폼 입력 규격 — h48 · r12 · bg-muted · px16 · body-md, placeholder ink-disabled, 테두리 없음 */
export const FIELD_INPUT_CLASS =
  "h-12 w-full min-w-0 rounded-xl bg-muted px-4 text-body-md text-foreground outline-none placeholder:text-ink-disabled focus-visible:ring-2 focus-visible:ring-mint disabled:opacity-50 read-only:text-muted-foreground";

type FieldProps = {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
};

/** 라벨(label-lg ink) + 입력 슬롯, 세로 gap 8. 로그인·게스트 입장·마이페이지 폼 공통 */
export function FormField({ label, htmlFor, children, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="text-label-lg text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

/** FIELD_INPUT_CLASS를 입힌 네이티브 input. shadcn Input(h-8·테두리)은 시안과 달라 쓰지 않는다. */
export function FieldInput({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(FIELD_INPUT_CLASS, className)} {...props} />;
}
