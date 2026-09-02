"use client";

import { useRouter } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { toCloneErrorMessage, toQuestionSets } from "@/features/host/sets/adapt";
import { SetsPage } from "@/features/host/sets/sets-page";
import { SetsSkeleton } from "@/features/host/sets/sets-skeleton";
import { useDuplicateQuestionSet, useQuestionSets } from "@/lib/queries/use-question-sets";

/** W-08 문제 세트 컨테이너 — 목록을 읽고, 복제 성공 시 에디터로 이동한다 */
export default function Page() {
  const router = useRouter();
  // 세트 목록은 확정·초안을 모두 보여준다(카드에 DRAFT 배지가 있다)
  const sets = useQuestionSets({ page: 0 });
  const duplicate = useDuplicateQuestionSet();

  if (sets.isPending) return <SetsSkeleton />;
  if (sets.isError)
    return <ScreenError message={sets.error.message} onRetry={() => sets.refetch()} />;

  const handleClone = (setId: string) => {
    if (duplicate.isPending) return;
    duplicate.mutate(Number(setId), {
      onSuccess: (res) => router.push(`/host/editor?set=${res.id}`),
    });
  };

  return (
    <SetsPage
      sets={toQuestionSets(sets.data.content)}
      onClone={handleClone}
      cloning={duplicate.isPending}
      cloneError={duplicate.isError ? toCloneErrorMessage(duplicate.error) : null}
    />
  );
}
