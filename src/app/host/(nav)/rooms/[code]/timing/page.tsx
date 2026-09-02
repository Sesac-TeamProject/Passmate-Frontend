"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import {
  toChangedQuestionRequests,
  toTimingErrorMessage,
  toTimingRows,
} from "@/features/host/timing/adapt";
import { TimingPage } from "@/features/host/timing/timing-page";
import { useQuestionSet, useUpdateQuestion } from "@/lib/queries/use-question-sets";
import { useRoomByPin } from "@/lib/queries/use-rooms";

/** 방에 확정 세트가 아직 연결돼 있지 않을 때 */
const NO_SET_MESSAGE = "이 방에 연결된 문제 세트를 찾지 못했어요";

/**
 * W-02b 문항별 시간 설정 컨테이너.
 *
 * 편집분(문항 id → 초)은 저장 전까지 여기서 들고 있다가, 저장할 때 **바뀐 문항만**
 * `PUT /question-sets/{setId}/questions/{questionId}`로 하나씩 보낸다 —
 * 세트 수정(`PUT /question-sets/{id}`)에는 문항 본문을 실을 수 없다(R-12).
 */
export default function Page() {
  const params = useParams<{ code: string }>();
  const pin = params.code;

  const room = useRoomByPin(pin);
  const setId = room.data?.questionSetId ?? null;
  const questionSet = useQuestionSet(setId);
  const updateQuestion = useUpdateQuestion();

  const [edits, setEdits] = useState<Record<number, number>>({});
  const [preset, setPreset] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (room.isPending || questionSet.isPending) return <ScreenLoading />;
  if (room.isError)
    return <ScreenError message={room.error.message} onRetry={() => room.refetch()} />;
  if (setId === null) return <ScreenError message={NO_SET_MESSAGE} />;
  if (questionSet.isError)
    return (
      <ScreenError message={questionSet.error.message} onRetry={() => questionSet.refetch()} />
    );

  const questions = questionSet.data.questions;
  const rows = toTimingRows(questions, edits);

  // 일괄 적용은 개별로 바꾼 문항도 덮는다 — 시안 안내는 "저장 전 개별 수정"을 지키라는 뜻이 아니라
  // 프리셋을 누르기 전까지 손댄 값이 남아 있다는 설명이라, 적용 시점에는 전부 같은 값으로 맞춘다.
  const applyPreset = () => {
    if (preset === null) return;
    setEdits(Object.fromEntries(rows.map((r) => [r.questionId, preset])));
  };

  const save = async () => {
    if (updateQuestion.isPending) return;
    setSaveError(null);

    const changed = toChangedQuestionRequests(questions, edits);
    if (changed.length === 0) return;

    try {
      // 문항 단위 API라 건별로 나간다. 하나라도 실패하면 멈추고 알린다(부분 저장은 남는다).
      for (const { questionId, body } of changed) {
        await updateQuestion.mutateAsync({ setId, questionId, body });
      }
      setEdits({});
    } catch (error) {
      setSaveError(toTimingErrorMessage(error));
    }
  };

  return (
    <TimingPage
      title={room.data.title}
      rows={rows}
      preset={preset}
      onPreset={setPreset}
      onApplyPreset={applyPreset}
      onChangeTime={(id, sec) => setEdits((prev) => ({ ...prev, [id]: sec }))}
      onSave={save}
      saving={updateQuestion.isPending}
      errorMessage={saveError}
    />
  );
}
