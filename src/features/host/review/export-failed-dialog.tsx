"use client";

import { ConfirmDialog } from "@/components/common/confirm-dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * 시안 문구는 "순위를 내보내지 못했어요"지만, 그건 프레임이 순위 화면에서 그려졌기 때문이다.
   * 이 화면이 내보내는 건 리포트라 부르는 이름을 넘겨 받는다.
   */
  title?: string;
  /** 실패 사유 한 줄. 넘기지 않으면 시안 기본 문구를 쓴다 */
  description?: string;
  onRetry: () => void;
  retrying?: boolean;
};

const DEFAULT_DESCRIPTION = "파일을 만드는 중에 연결이 끊겼어요. 잠시 후 다시 시도해 주세요.";

/**
 * 내보내기 · 저장 실패 모달 (design.pen "04 · 상태 · 오류 — 웹" 프레임 WVZ3y).
 *
 * 시안이 이걸 모달로 그린 이유는 04 보드 B 규칙 때문이다 — 작업 실패는 화면을 갈아 끼우지
 * 않고 카드 안에서 처리하고, 되돌아갈 길([닫기])을 함께 둔다. 보고 있던 리포트는 그대로 남는다.
 */
export function ExportFailedDialog({
  open,
  onOpenChange,
  title = "리포트를 내보내지 못했어요",
  description,
  onRetry,
  retrying,
}: Props) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description ?? DEFAULT_DESCRIPTION}
      cancelLabel="닫기"
      confirmLabel={retrying ? "내보내는 중…" : "다시 시도"}
      pending={retrying}
      onConfirm={onRetry}
    />
  );
}
