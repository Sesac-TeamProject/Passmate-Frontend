"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  cancelLabel?: string;
  /** 진행 중 회전 링(PendingLabel)을 함께 넣을 수 있어 문자열로 좁히지 않는다 */
  confirmLabel: ReactNode;
  /** primary: mint(로그아웃 등) · ink: 검정(회원 탈퇴 등 시안이 ink로 그린 위험 액션) */
  confirmTone?: "primary" | "ink";
  pending?: boolean;
  onConfirm: () => void;
};

/**
 * 확인 다이얼로그 (디자인 C-02-11 로그아웃) — 420px · r20 · padding 28 · 제목 heading-md · 본문 body-md · 우측 버튼 2개.
 * 폰 폭(768px 미만)은 앱 시안 M-12-11(450:6473) — 320px · padding 24 · 가운데 정렬 · 같은 폭 버튼 2개.
 * 420px 그대로면 390px 화면에서 좌우가 잘린다.
 */
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
        className="flex w-[420px] max-w-[420px] flex-col gap-2 rounded-[20px] bg-card p-7 text-body-md ring-0 max-md:w-[320px] max-md:max-w-[calc(100%-2.5rem)] max-md:p-6 max-md:text-center sm:max-w-[420px]"
      >
        <DialogTitle className="text-heading-md text-foreground">{title}</DialogTitle>
        {description && (
          <DialogDescription className="text-body-md text-muted-foreground">
            {description}
          </DialogDescription>
        )}
        {/* 폰 시안은 본문과 버튼 사이가 24(간격 8 + 빈칸 8 + 간격 8) */}
        <div className="mt-2 flex justify-end gap-2.5 max-md:mt-4">
          <Button
            variant="outline"
            size="xl"
            className="bg-card text-foreground max-md:flex-1"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            {cancelLabel}
          </Button>
          <Button
            size="xl"
            className={cn(
              "max-md:flex-1",
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
