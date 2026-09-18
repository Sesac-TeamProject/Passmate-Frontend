"use client";

import { X } from "lucide-react";
import { PendingLabel } from "@/components/common/pending-label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { RoomCreateRequest } from "@/lib/types/dto";
import type { QuestionSetOption } from "./adapt";
import { NewRoomForm, type NewRoomInitialValues } from "./new-room-form";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 세트 · 등급을 아직 못 읽었다 — 시트는 먼저 올라오고 안에서 기다린다 */
  loading?: boolean;
  /** 세트 조회 실패 — 고를 것이 없어 폼을 그리지 못한다 */
  setsError?: { message: string; retry: () => void } | null;
  sets: QuestionSetOption[];
  level: number | null;
  onSubmit: (body: RoomCreateRequest) => void;
  pending?: boolean;
  errorMessage?: string | null;
  initialValues?: NewRoomInitialValues;
};

/**
 * M-13a 새 방 만들기 시트 (시안 406:5952) — 내가 만든 방 위로 올라오는 아래 시트.
 *
 * 화면을 옮기지 않는다. 시안은 뒤에 내가 만든 방이 그대로 비치는 그림인데,
 * `/host/rooms/new` 로 이동하면 그 라우트에는 뒤에 깔 화면이 없어 어두운 판만 남는다.
 * **폰에서만 열린다** — 여는 FAB 이 폰 전용 영역 안에 있어 PC 는 지금처럼 전체 화면(W-02)으로 간다.
 *
 * 폼은 `NewRoomForm` 한 벌을 그대로 쓴다 — 시트용으로 복제하면 임시 보관값(`writeNewRoomDraft`)이
 * 두 번 돌아 서로 덮어쓴다.
 */
export function NewRoomSheet({
  open,
  onOpenChange,
  loading,
  setsError,
  sets,
  level,
  onSubmit,
  pending,
  errorMessage,
  initialValues,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        // 공용 다이얼로그는 화면 가운데다 — 아래 시트로 눕히려고 위치·모서리·폭을 덮어쓴다.
        // 내용이 길면(유료 방을 펼친 경우) 시트 안에서 스크롤한다.
        className="top-auto bottom-0 left-0 flex max-h-[88dvh] w-full max-w-full translate-x-0 translate-y-0 flex-col gap-4 overflow-y-auto rounded-[24px] rounded-b-none bg-card px-5 pt-3 pb-[max(1.75rem,env(safe-area-inset-bottom))] ring-0 sm:max-w-full data-open:zoom-in-100 data-open:slide-in-from-bottom data-closed:zoom-out-100 data-closed:slide-out-to-bottom"
      >
        <span aria-hidden className="mx-auto h-1 w-9 shrink-0 rounded-full bg-border" />
        <div className="flex items-center justify-between">
          <DialogTitle className="text-heading-md text-ink">새 방 만들기</DialogTitle>
          <DialogClose
            aria-label="닫기"
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-mint"
          >
            <X size={24} strokeWidth={2} aria-hidden />
          </DialogClose>
        </div>

        {loading ? (
          <p className="py-12 text-center text-label-lg text-muted-foreground">
            <PendingLabel>불러오는 중…</PendingLabel>
          </p>
        ) : setsError ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-body-md text-muted-foreground">{setsError.message}</p>
            <Button variant="outline" onClick={setsError.retry}>
              다시 시도
            </Button>
          </div>
        ) : (
          /*
           * 만들기가 서버·네트워크로 깨져도 시트 안에서 한 줄로 알린다 — 전체 화면 W-02e 는
           * 뒤에 깔린 내가 만든 방을 덮어 버려 "위에 뜬 시트" 라는 시안의 그림이 무너진다.
           */
          <NewRoomForm
            sets={sets}
            level={level}
            onSubmit={onSubmit}
            pending={pending}
            errorMessage={errorMessage}
            editorHref="/host/editor"
            initialValues={initialValues}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
