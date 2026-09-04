"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import {
  movedQuestionOrder,
  toConfirmErrorMessage,
  toEditorQuestions,
  toFormValues,
  toQuestionErrorMessage,
  toQuestionRequest,
  validateQuestionForm,
} from "@/features/host/editor/adapt";
import { EditorPage } from "@/features/host/editor/editor-page";
import {
  EMPTY_QUESTION_FORM,
  type EditorQuestion,
  type QuestionFormValues,
} from "@/features/host/editor/types";
import {
  toGenerateErrorMessage,
  useAddQuestion,
  useConfirmQuestionSet,
  useCreateQuestionSet,
  useDeleteQuestion,
  useGenerateQuestions,
  useQuestionSet,
  useRegenerateQuestion,
  useUpdateQuestion,
  useUpdateQuestionSet,
} from "@/lib/queries/use-question-sets";
import type { AiGenerateRequest } from "@/lib/types/dto";

/** 세트를 아직 안 만든 채로 문항부터 추가할 때 붙는 기본 제목 */
const NEW_SET_TITLE = "새 문제 세트";

/**
 * W-03 문제 에디터 컨테이너. `?set=<id>`가 있으면 그 세트를, 없으면 빈 목록에서 시작한다.
 *
 * 저장 방식이 세트 통째가 아니라 **문항 단위**다(R-12): 추가·수정·삭제는 문항 API로 각각 나가고,
 * 순서만 `PUT /question-sets/{id}`의 `questionOrder`로 보낸다. 서버가 진실이라 성공하면 상세를 다시 읽는다.
 */
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
  const generate = useGenerateQuestions();
  const confirm = useConfirmQuestionSet();
  const addQuestion = useAddQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();
  const regenerate = useRegenerateQuestion();
  const updateSet = useUpdateQuestionSet();

  /** 열려 있는 폼. null이면 닫힌 상태 */
  const [form, setForm] = useState<{
    values: QuestionFormValues;
    editingId: number | null;
  } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const detail = questionSet.data;
  const questions = detail ? toEditorQuestions(detail.questions) : [];
  const readOnly = detail?.set.status === "CONFIRMED";

  /**
   * 생성은 2단계다 — 빈 세트를 먼저 만들고(POST /question-sets) 그 세트에 문항을 붙인다
   * (POST …/questions/generate). 편집 중인 세트가 없으면 주제를 제목으로 세트부터 만든다.
   */
  const handleGenerate = async (body: AiGenerateRequest) => {
    if (generate.isPending || create.isPending) return;

    try {
      const targetId = setId ?? (await create.mutateAsync({ title: body.topic })).id;
      await generate.mutateAsync({ setId: targetId, body });
      setSetId(targetId);
    } catch {
      // 실패 문구는 아래 generateError가 create·generate 양쪽 오류에서 만든다
    }
  };

  const openCreateForm = () => {
    setFormError(null);
    setForm({ values: EMPTY_QUESTION_FORM, editingId: null });
  };

  const openEditForm = (question: EditorQuestion) => {
    setFormError(null);
    setForm({ values: toFormValues(question), editingId: question.id });
  };

  const handleFormSubmit = async () => {
    if (!form) return;

    const invalid = validateQuestionForm(form.values);
    if (invalid) {
      setFormError(invalid);
      return;
    }

    const body = toQuestionRequest(form.values);

    try {
      // 문항을 처음 직접 추가하는 경우엔 세트가 아직 없을 수 있다 — 세트부터 만든다.
      // 제목은 화면 머리말과 같은 기본값을 쓴다(지문을 잘라 붙이면 목록에서 읽기 어려운 이름이 된다).
      const targetId = setId ?? (await create.mutateAsync({ title: NEW_SET_TITLE })).id;

      if (form.editingId !== null) {
        await updateQuestion.mutateAsync({ setId: targetId, questionId: form.editingId, body });
      } else {
        await addQuestion.mutateAsync({ setId: targetId, body });
      }
      setSetId(targetId);
      setForm(null);
      setFormError(null);
    } catch (error) {
      setFormError(toQuestionErrorMessage(error));
    }
  };

  const handleDelete = (question: EditorQuestion) => {
    if (setId === null) return;
    deleteQuestion.mutate({ setId, questionId: question.id });
  };

  const handleRegenerate = (question: EditorQuestion) => {
    if (setId === null) return;
    regenerate.mutate({ setId, questionId: question.id });
  };

  const handleMove = (question: EditorQuestion, direction: "up" | "down") => {
    if (setId === null || !detail) return;
    const questionOrder = movedQuestionOrder(questions, question.id, direction);
    if (!questionOrder) return;

    updateSet.mutate({
      setId,
      body: { title: detail.set.title, description: detail.set.description, questionOrder },
    });
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

  // 상단은 세트 제목만 쓴다 — 어디에 있는지는 옆의 "문제 세트 › 수정하기" 칩이 말한다.
  // 예전 "· 문제 준비"는 지운 3단계 플로우(2단계 이름)의 흔적이다.
  const title = detail?.set.title ?? "새 문제 세트";
  const listMutationError =
    deleteQuestion.error ?? regenerate.error ?? (updateSet.isError ? updateSet.error : null);

  return (
    <EditorPage
      title={title}
      questions={questions}
      readOnly={readOnly ?? false}
      onGenerate={handleGenerate}
      generating={create.isPending || generate.isPending}
      generateError={
        generate.isError
          ? toGenerateErrorMessage(generate.error)
          : create.isError
            ? toGenerateErrorMessage(create.error)
            : null
      }
      form={
        form
          ? {
              values: form.values,
              mode: form.editingId !== null ? "edit" : "create",
              onChange: (values) => setForm({ ...form, values }),
              onSubmit: handleFormSubmit,
              onCancel: () => {
                setForm(null);
                setFormError(null);
              },
              pending: addQuestion.isPending || updateQuestion.isPending || create.isPending,
              errorMessage: formError,
            }
          : null
      }
      onAddManual={openCreateForm}
      onEdit={openEditForm}
      onRegenerate={handleRegenerate}
      onDelete={handleDelete}
      onMove={handleMove}
      busyQuestionId={
        deleteQuestion.isPending
          ? deleteQuestion.variables.questionId
          : regenerate.isPending
            ? regenerate.variables.questionId
            : updateSet.isPending
              ? -1
              : null
      }
      listError={listMutationError ? toQuestionErrorMessage(listMutationError) : null}
      onConfirm={handleConfirm}
      confirming={confirm.isPending}
      canConfirm={setId !== null && questions.length > 0 && !readOnly}
      confirmError={confirm.isError ? toConfirmErrorMessage(confirm.error) : null}
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
