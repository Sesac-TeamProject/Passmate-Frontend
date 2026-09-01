"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { ReportReason } from "@/lib/types/dto";
import { cn } from "@/lib/utils";
import { ROOM_REPORT_REASONS } from "./report-reasons";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: ReportReason, detail: string | null) => void;
  pending: boolean;
  errorMessage: string | null;
};

/**
 * P-Web 신고 다이얼로그 (design.pen 프레임 Ozq4i).
 * 게스트도 익명으로 낼 수 있다(POST /reports). 사유를 고르지 않으면 보낼 수 없다 —
 * 운영팀이 분류 없는 신고를 받으면 처리할 수 없다.
 */
export function ReportDialog({ open, onOpenChange, onSubmit, pending, errorMessage }: Props) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [detail, setDetail] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex w-[520px] max-w-[520px] flex-col gap-2 rounded-[20px] bg-card p-8 sm:max-w-[520px]"
      >
        <DialogTitle className="text-heading-lg text-ink">이 방을 신고할게요</DialogTitle>
        <DialogDescription className="text-body-lg text-muted-foreground">
          무엇이 문제였는지 알려 주시면 운영팀이 확인해요.
        </DialogDescription>

        <div className="mt-4 flex flex-col gap-2" role="radiogroup" aria-label="신고 사유">
          {ROOM_REPORT_REASONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={reason === value}
              onClick={() => setReason(value)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-left text-body-lg transition-colors",
                reason === value
                  ? "bg-mint-bg text-mint-dark"
                  : "bg-muted text-ink hover:bg-accent",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "size-4 shrink-0 rounded-full border-2",
                  reason === value ? "border-mint bg-mint" : "border-ink-disabled",
                )}
              />
              {label}
            </button>
          ))}
        </div>

        <label className="mt-4 flex flex-col gap-2">
          <span className="text-label-lg text-muted-foreground">자세한 내용 (선택)</span>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="언제 어떤 일이 있었는지 적어 주세요"
            rows={3}
            className="resize-none rounded-xl bg-muted px-4 py-3 text-body-lg text-ink outline-none placeholder:text-ink-disabled focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        {errorMessage ? (
          <p role="alert" className="text-label-lg text-negative-soft-foreground">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-4 flex items-center gap-3">
          <Button
            size="xl"
            variant="outline"
            className="w-[140px]"
            onClick={() => onOpenChange(false)}
          >
            취소
          </Button>
          <Button
            size="xl"
            className="flex-1"
            disabled={reason === null || pending}
            onClick={() => reason && onSubmit(reason, detail.trim() || null)}
          >
            {pending ? "보내는 중…" : "신고하기"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
