"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toTimingRows } from "@/features/host/timing/adapt";
import { TimingPage } from "@/features/host/timing/timing-page";
import { useQuestionSet, useUpdateQuestionSet } from "@/lib/queries/use-question-sets";
import { useRoomByPin } from "@/lib/queries/use-rooms";

/** 방에 문제 세트가 연결돼 있지 않을 때 (계약이 questionSetId를 아직 안 준다 — DESIGN_GAPS D-6) */
const NO_SET_MESSAGE = "이 방에 연결된 문제 세트를 찾지 못했어요";

type Edit = { timeLimitSec: number; autoAdvance: boolean };

/**
 * W-02b 문항별 시간 설정 컨테이너.
 * 방 코드로 세트를 찾아 문항을 읽고, 편집분은 저장 전까지 여기서 들고 있다가 세트 PATCH로 한 번에 보낸다.
 */
export default function Page() {
  const params = useParams<{ code: string }>();
  const pin = params.code;

  const room = useRoomByPin(pin);
  const setId = room.data?.questionSetId ?? null;
  const questionSet = useQuestionSet(setId);
  const update = useUpdateQuestionSet(setId ?? 0);

  const [edits, setEdits] = useState<Record<number, Edit>>({});
  const [preset, setPreset] = useState<number | null>(null);

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

  const patch = (questionId: number, next: Partial<Edit>) => {
    const row = rows.find((r) => r.questionId === questionId);
    if (!row) return;
    setEdits((prev) => ({
      ...prev,
      [questionId]: { timeLimitSec: row.timeLimitSec, autoAdvance: row.autoAdvance, ...next },
    }));
  };

  // 일괄 적용은 개별로 바꾼 문항도 덮는다 — 시안 안내는 "저장 전 개별 수정"을 지키라는 뜻이 아니라
  // 프리셋을 누르기 전까지 손댄 값이 남아 있다는 설명이라, 적용 시점에는 전부 같은 값으로 맞춘다.
  const applyPreset = () => {
    if (preset === null) return;
    setEdits(
      Object.fromEntries(
        rows.map((r) => [r.questionId, { timeLimitSec: preset, autoAdvance: r.autoAdvance }]),
      ),
    );
  };

  const save = () => {
    if (update.isPending) return;
    update.mutate({
      questions: questions.map((q) => {
        const edit = edits[q.questionId];
        return edit ? { ...q, ...edit } : q;
      }),
    });
  };

  return (
    <TimingPage
      title={room.data.title}
      rows={rows}
      preset={preset}
      onPreset={setPreset}
      onApplyPreset={applyPreset}
      onChangeTime={(id, sec) => patch(id, { timeLimitSec: sec })}
      onToggleAuto={(id, next) => patch(id, { autoAdvance: next })}
      onSave={save}
      saving={update.isPending}
      errorMessage={update.isError ? update.error.message : null}
    />
  );
}
