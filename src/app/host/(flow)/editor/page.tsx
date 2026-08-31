"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toEditorQuestions, toGenerateErrorMessage } from "@/features/host/editor/adapt";
import { EditorPage } from "@/features/host/editor/editor-page";
import {
  useAiUsage,
  useConfirmQuestionSet,
  useGenerateQuestionSet,
  useQuestionSet,
} from "@/lib/queries/use-question-sets";
import type { GenerateQuestionSetRequest } from "@/lib/types/dto";

/** W-03 문제 에디터 컨테이너. ?set=<id>가 있으면 그 세트를, 없으면 빈 목록에서 시작한다 */
function EditorContainer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const querySetId = searchParams.get("set");

  const [setId, setSetId] = useState<number | null>(querySetId ? Number(querySetId) : null);

  const questionSet = useQuestionSet(setId);
  const usage = useAiUsage();
  const generate = useGenerateQuestionSet();
  const confirm = useConfirmQuestionSet();

  const handleGenerate = (body: GenerateQuestionSetRequest) => {
    if (generate.isPending) return;
    generate.mutate(body, { onSuccess: (res) => setSetId(res.setId) });
  };

  const handleConfirm = () => {
    if (setId === null || confirm.isPending) return;
    const id = setId;
    confirm.mutate(id, { onSuccess: () => router.push(`/host/rooms/new?set=${id}`) });
  };

  // AI 생성 직후에도 setId가 null→값으로 바뀌며 useQuestionSet이 새로 로딩 상태가 된다 — 그때 전체
  // 화면을 로딩으로 덮으면 GeneratePanel의 입력이 통째로 언마운트돼 사라진다. 문항 목록만 비워 둔 채
  // 기다리고, 진짜 조회 실패(잘못된 ?set= 등)일 때만 전체 화면 오류로 막는다.
  if (setId !== null && questionSet.isError)
    return (
      <ScreenError message={questionSet.error.message} onRetry={() => questionSet.refetch()} />
    );

  const questions = questionSet.data ? toEditorQuestions(questionSet.data.questions) : [];
  const title = questionSet.data?.title
    ? `${questionSet.data.title} · 문제 준비`
    : "새 문제 세트 · 문제 준비";

  return (
    <EditorPage
      title={title}
      questions={questions}
      usage={usage.data}
      onGenerate={handleGenerate}
      generating={generate.isPending}
      generateError={generate.isError ? toGenerateErrorMessage(generate.error) : null}
      onConfirm={handleConfirm}
      confirming={confirm.isPending}
      canConfirm={setId !== null}
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={<ScreenLoading />}>
      <EditorContainer />
    </Suspense>
  );
}
