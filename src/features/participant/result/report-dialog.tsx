"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { PendingLabel } from "@/components/common/pending-label";
import type { ReportType } from "@/lib/types/dto";
import { cn } from "@/lib/utils";
import { ROOM_REPORT_REASONS } from "./report-reasons";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: ReportType, detail: string | null) => void;
  pending: boolean;
  errorMessage: string | null;
};

/**
 * P-Web 신고 다이얼로그 (design.pen 프레임 Ozq4i).
 * 게스트도 익명으로 낼 수 있다(POST /reports). 사유를 고르지 않으면 보낼 수 없다 —
 * 운영팀이 분류 없는 신고를 받으면 처리할 수 없다.
 *
 * 앱 시안에는 신고 화면이 없다 — 폰은 웹 시안을 그대로 두고 폭·여백만 화면에 맞춘다.
 */
export function ReportDialog({ open, onOpenChange, onSubmit, pending, errorMessage }: Props) {
  const [reason, setReason] = useState<ReportType | null>(null);
  const [detail, setDetail] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        // 520px 그대로면 390px 화면에서 좌우가 52px씩 잘리고 사유 라디오 점이 화면 밖으로 나간다
        // (실측 2026-09-19). 폰은 본문과 같은 좌우 20 여백을 남기고 폭을 채운다 — ConfirmDialog와 같은 규칙.
        className="flex w-[520px] max-w-[520px] flex-col gap-2 rounded-[20px] bg-card p-8 max-md:w-full max-md:max-w-[calc(100%-2.5rem)] max-md:p-6 sm:max-w-[520px]"
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
            className="w-[140px] max-md:w-auto max-md:flex-1"
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
            {pending ? <PendingLabel>보내는 중…</PendingLabel> : "신고하기"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
