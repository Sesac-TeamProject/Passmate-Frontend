"use client";

import { useRouter } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toQuestionSets } from "@/features/host/sets/adapt";
import { SetsPage } from "@/features/host/sets/sets-page";
import { useDuplicateQuestionSet, useQuestionSets } from "@/lib/queries/use-question-sets";

/** W-08 문제 세트 컨테이너 — 목록을 읽고, 복제 성공 시 에디터로 이동한다 */
export default function Page() {
  const router = useRouter();
  const sets = useQuestionSets();
  const duplicate = useDuplicateQuestionSet();

  if (sets.isPending) return <ScreenLoading />;
  if (sets.isError)
    return <ScreenError message={sets.error.message} onRetry={() => sets.refetch()} />;

  const handleClone = (setId: string) => {
    if (duplicate.isPending) return;
    duplicate.mutate(Number(setId), {
      onSuccess: (res) => router.push(`/host/editor?set=${res.setId}`),
    });
  };

  return (
    <SetsPage
      sets={toQuestionSets(sets.data.items ?? [])}
      onClone={handleClone}
      cloning={duplicate.isPending}
    />
  );
}
