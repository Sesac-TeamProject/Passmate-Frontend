"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  cancelLabel?: string;
  confirmLabel: string;
  /** primary: mint(로그아웃 등) · ink: 검정(회원 탈퇴 등 시안이 ink로 그린 위험 액션) */
  confirmTone?: "primary" | "ink";
  pending?: boolean;
  onConfirm: () => void;
};

/** 확인 다이얼로그 (디자인 C-02-11 로그아웃) — 420px · r20 · padding 28 · 제목 heading-md · 본문 body-md · 우측 버튼 2개 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelLabel = "취소",
  confirmLabel,
  confirmTone = "primary",
  pending,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex w-[420px] max-w-[420px] flex-col gap-2 rounded-[20px] bg-card p-7 text-body-md ring-0 sm:max-w-[420px]"
      >
        <DialogTitle className="text-heading-md text-foreground">{title}</DialogTitle>
        {description && (
          <DialogDescription className="text-body-md text-muted-foreground">
            {description}
          </DialogDescription>
        )}
        <div className="mt-2 flex justify-end gap-2.5">
          <Button
            variant="outline"
            size="xl"
            className="bg-card text-foreground"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            {cancelLabel}
          </Button>
          <Button
            size="xl"
            className={cn(
              confirmTone === "ink" && "bg-foreground text-background hover:bg-foreground/90",
            )}
            onClick={onConfirm}
            disabled={pending}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
