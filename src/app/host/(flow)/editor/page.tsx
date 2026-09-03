"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toEditorQuestions, toGenerateErrorMessage } from "@/features/host/editor/adapt";
import { EditorPage } from "@/features/host/editor/editor-page";
import {
  useConfirmQuestionSet,
  useCreateQuestionSet,
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
  const [lastQuerySetId, setLastQuerySetId] = useState<string | null>(querySetId);

  // 뒤로/앞으로 가기로 ?set= 이 바뀌면 편집 중인 세트도 따라간다 — 렌더 중 조정
  // (react.dev "Adjusting state when a prop changes"). AI 생성으로 setId만 바뀐 경우는 건드리지 않는다.
  if (querySetId !== lastQuerySetId) {
    setLastQuerySetId(querySetId);
    setSetId(querySetId ? Number(querySetId) : null);
  }

  const questionSet = useQuestionSet(setId);
  const create = useCreateQuestionSet();
  const generate = useGenerateQuestionSet();
  const confirm = useConfirmQuestionSet();

  // TODO(계약): AI 사용량 표시 — GET /me/ai-usage는 API 명세서 v2에 없다.
  // 명세는 "최초 5회 무료" 후 코인 차감(FR-075)인데 잔여 횟수를 주는 엔드포인트가 없다.
  // 백엔드 회신 후 GET /users/me/coins 또는 신규 계약으로 되살린다.

  /**
   * 명세는 생성이 2단계다 — 빈 세트를 먼저 만들고(POST /question-sets),
   * 그 세트에 문항을 붙인다(POST /question-sets/{setId}/questions/generate).
   * 편집 중인 세트가 없으면 주제를 제목으로 세트부터 만든다.
   */
  const handleGenerate = async (body: GenerateQuestionSetRequest) => {
    if (generate.isPending || create.isPending) return;

    try {
      const targetId = setId ?? (await create.mutateAsync({ title: body.topic })).setId;
      const res = await generate.mutateAsync({ setId: targetId, body });
      setSetId(res.setId);
    } catch {
      // 실패 문구는 아래 generateError가 create·generate 양쪽 오류에서 만든다
    }
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
      onGenerate={handleGenerate}
      generating={create.isPending || generate.isPending}
      generateError={
        generate.isError
          ? toGenerateErrorMessage(generate.error)
          : create.isError
            ? toGenerateErrorMessage(create.error)
            : null
      }
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
