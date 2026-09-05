"use client";

import Link from "next/link";
import type { QuestionSet } from "@/features/host/types";
import { SetCard } from "./set-card";
import { SetDetailPanel } from "./set-detail-panel";

type Props = {
  sets: QuestionSet[];
  /** 우측 패널이 보여 줄 세트. 목록이 비면 null */
  selected: QuestionSet | null;
  onSelect: (setId: string) => void;
  /** 고른 세트의 문항 미리보기를 아직 읽는 중 */
  detailLoading?: boolean;
  onClone: (setId: string) => void;
  cloning?: boolean;
  /** 복제 실패 문구 — 서버에 복제 API가 아직 없다 */
  cloneError?: string | null;
  onDelete: (setId: string) => void;
  deletingSetId?: string | null;
  /** 삭제 실패 문구 — 안 끝난 방이 쓰고 있으면 서버가 막는다 */
  deleteError?: string | null;
};

/** W-08 문제 세트 관리 — 목록 + 우측 상세 패널(세트 재활용) */
export function SetsPage({
  sets,
  selected,
  onSelect,
  detailLoading = false,
  onClone,
  cloning,
  cloneError = null,
  onDelete,
  deletingSetId = null,
  deleteError = null,
}: Props) {
  return (
    <div className="flex min-h-screen">
      <main className="flex flex-1 flex-col gap-[18px] py-7 pr-6 pl-8">
        <div className="flex items-center justify-between">
          <h1 className="text-heading-lg text-ink">문제 세트</h1>
          <Link
            href="/host/editor"
            className="flex h-[46px] items-center rounded-[14px] bg-mint-tint px-5 text-label-lg text-mint-dark transition-colors hover:bg-mint hover:text-white"
          >
            + 새 세트
          </Link>
        </div>
        {(cloneError ?? deleteError) !== null ? (
          <p role="alert" className="text-label-lg text-negative">
            {cloneError ?? deleteError}
          </p>
        ) : null}
        {sets.length === 0 ? (
          // TODO(design): DESIGN_GAPS W-08 빈 상태
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed py-16 text-center text-body-md text-muted-foreground">
            아직 만든 문제 세트가 없어요
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-[18px]">
            {sets.map((s) => (
              <SetCard
                key={s.id}
                set={s}
                selected={s.id === selected?.id}
                deleting={s.id === deletingSetId}
                onSelect={() => onSelect(s.id)}
                onClone={() => onClone(s.id)}
                onDelete={() => onDelete(s.id)}
                cloning={cloning}
              />
            ))}
          </div>
        )}
      </main>
      {selected && (
        <SetDetailPanel
          set={selected}
          previewLoading={detailLoading}
          onClone={() => onClone(selected.id)}
          cloning={cloning}
        />
      )}
    </div>
  );
}
