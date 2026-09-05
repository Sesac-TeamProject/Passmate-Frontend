"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import {
  toCloneErrorMessage,
  toDeleteErrorMessage,
  toQuestionSets,
  toSetDetail,
} from "@/features/host/sets/adapt";
import { SetsPage } from "@/features/host/sets/sets-page";
import { SetsSkeleton } from "@/features/host/sets/sets-skeleton";
import {
  useDeleteQuestionSet,
  useDuplicateQuestionSet,
  useQuestionSet,
  useQuestionSets,
} from "@/lib/queries/use-question-sets";

/** W-08 문제 세트 컨테이너 — 목록을 읽고, 복제 성공 시 에디터로 이동한다 */
export default function Page() {
  const router = useRouter();
  // 세트 목록은 확정·초안을 모두 보여준다(카드에 DRAFT 배지가 있다)
  const sets = useQuestionSets({ page: 0 });
  const duplicate = useDuplicateQuestionSet();
  const remove = useDeleteQuestionSet();
  // 삭제는 되돌릴 수 없으니 한 번 묻는다
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // 우측 패널이 보여 줄 세트. 고르기 전에는 첫 세트다
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const list = sets.data ? toQuestionSets(sets.data.content) : [];
  const selected = list.find((s) => s.id === selectedId) ?? list[0] ?? null;
  /**
   * 목록 응답에는 문항 본문이 없다 — 유형 칩·미리보기를 채우려면 **고른 세트의 상세**를
   * 따로 읽어야 한다. 목록만 읽던 예전 화면은 그래서 미리보기가 늘 비어 있었다.
   */
  const detail = useQuestionSet(selected === null ? null : Number(selected.id));
  // 세트를 바꾸는 사이 이전 세트의 문항이 잠깐 남지 않게 id가 맞을 때만 붙인다
  const detailMatches = detail.data !== undefined && String(detail.data.set.id) === selected?.id;
  const selectedWithPreview =
    selected !== null && detailMatches
      ? { ...selected, ...toSetDetail(detail.data as NonNullable<typeof detail.data>) }
      : selected;

  if (sets.isPending) return <SetsSkeleton />;
  if (sets.isError)
    return <ScreenError message={sets.error.message} onRetry={() => sets.refetch()} />;

  const handleClone = (setId: string) => {
    if (duplicate.isPending) return;
    duplicate.mutate(Number(setId), {
      onSuccess: (res) => router.push(`/host/editor?set=${res.id}`),
    });
  };

  const handleDelete = () => {
    if (pendingDeleteId === null || remove.isPending) return;
    remove.mutate(Number(pendingDeleteId), { onSettled: () => setPendingDeleteId(null) });
  };

  return (
    <>
      <SetsPage
        sets={list}
        selected={selectedWithPreview}
        onSelect={setSelectedId}
        detailLoading={selected !== null && detail.isPending}
        onClone={handleClone}
        cloning={duplicate.isPending}
        cloneError={duplicate.isError ? toCloneErrorMessage(duplicate.error) : null}
        onDelete={setPendingDeleteId}
        deletingSetId={remove.isPending ? (remove.variables?.toString() ?? null) : null}
        deleteError={remove.isError ? toDeleteErrorMessage(remove.error) : null}
      />
      <ConfirmDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
        title="이 문제 세트를 삭제할까요?"
        description="목록에서 사라져요. 이미 끝난 방의 출제 기록은 그대로 남습니다."
        confirmLabel="삭제"
        confirmTone="ink"
        pending={remove.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
