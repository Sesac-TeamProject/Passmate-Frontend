"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import {
  hasTimingChanges,
  type TimingEdits,
  toQuestionTimesRequest,
  toTimingErrorMessage,
  toTimingRows,
} from "@/features/host/timing/adapt";
import { TimingPage } from "@/features/host/timing/timing-page";
import {
  useRoom,
  useRoomByPin,
  useRoomQuestionTimes,
  useUpdateRoomQuestionTimes,
} from "@/lib/queries/use-rooms";

/** 방에 확정 세트가 아직 연결돼 있지 않을 때 */
const NO_SET_MESSAGE = "이 방에 연결된 문제 세트를 찾지 못했어요";

/**
 * W-02b 문항별 시간 설정 컨테이너.
 *
 * 세트가 아니라 **방**을 고친다 — `GET/PUT /rooms/{roomId}/question-times`. 방에는 확정 세트만
 * 붙고 확정 세트의 문항은 409로 막히므로(B-18), 시간은 세트를 두고 이 방에서만 덮어쓴다.
 * 편집분은 저장 전까지 여기서 들고 있다가 저장할 때 **전체 교체**로 한 번에 보낸다.
 */
export default function Page() {
  const params = useParams<{ code: string }>();
  const pin = params.code;

  const room = useRoomByPin(pin);
  // PIN 조회에는 연결된 세트·상태가 없다(입장 전 정보) — 호스트용 방 상세에서 읽는다
  const detail = useRoom(room.data?.id ?? null);
  // 세트가 안 붙은 방은 서버가 409 `QUESTION_SET_REQUIRED`로 답한다 — 방 상세에서 먼저 보고 부르지 않는다
  const roomIdWithSet = detail.data?.questionSetId !== undefined ? detail.data.id : null;
  const questionTimes = useRoomQuestionTimes(roomIdWithSet);
  const updateQuestionTimes = useUpdateRoomQuestionTimes();

  const [edits, setEdits] = useState<TimingEdits>({});
  const [preset, setPreset] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 세 조회가 앞의 결과에 매달려 있다(pin → roomId → 문항 시간). 뒤 조회는 앞이 끝나기 전까지
  // `enabled: false`이고 그 상태도 `isPending`이라, pending을 한 줄로 묶으면 앞 조회의 에러도
  // "세트 없음"도 뒤의 분기에 닿지 못하고 로딩만 돈다 — 조회마다 pending → error 순으로 가른다.
  if (room.isPending) return <ScreenLoading />;
  if (room.isError)
    return <ScreenError message={room.error.message} onRetry={() => room.refetch()} />;
  if (detail.isPending) return <ScreenLoading />;
  if (detail.isError)
    return <ScreenError message={detail.error.message} onRetry={() => detail.refetch()} />;
  if (roomIdWithSet === null) return <ScreenError message={NO_SET_MESSAGE} />;
  if (questionTimes.isPending) return <ScreenLoading />;
  if (questionTimes.isError)
    return (
      <ScreenError message={questionTimes.error.message} onRetry={() => questionTimes.refetch()} />
    );

  const current = detail.data;
  const questions = questionTimes.data.questions;
  const rows = toTimingRows(questions, edits);
  // 시간은 방이 대기 중일 때만 바꿀 수 있다(서버 409 `CONFLICT`). 대기실은 시작 후 이 화면 링크를
  // 감추지만 주소로는 들어올 수 있어 처음부터 읽기 전용으로 둔다 — 세트 확정 여부와는 무관하다.
  const readOnly = current.status !== "WAITING";

  // 일괄 적용은 개별로 바꾼 문항도 덮는다 — 시안 안내는 "저장 전 개별 수정"을 지키라는 뜻이 아니라
  // 프리셋을 누르기 전까지 손댄 값이 남아 있다는 설명이라, 적용 시점에는 전부 같은 값으로 맞춘다.
  const applyPreset = () => {
    if (preset === null) return;
    setEdits((prev) =>
      Object.fromEntries(
        rows.map((r) => [r.questionId, { ...prev[r.questionId], timeLimitSec: preset }]),
      ),
    );
  };

  const save = async () => {
    if (updateQuestionTimes.isPending) return;
    setSaveError(null);
    if (!hasTimingChanges(questions, edits)) return;

    try {
      await updateQuestionTimes.mutateAsync({
        roomId: current.id,
        body: toQuestionTimesRequest(questions, edits),
      });
      setEdits({});
    } catch (error) {
      setSaveError(toTimingErrorMessage(error));
    }
  };

  return (
    <TimingPage
      title={current.title}
      rows={rows}
      preset={preset}
      onPreset={setPreset}
      onApplyPreset={applyPreset}
      onChangeTime={(id, sec) =>
        setEdits((prev) => ({ ...prev, [id]: { ...prev[id], timeLimitSec: sec } }))
      }
      onSave={save}
      saving={updateQuestionTimes.isPending}
      errorMessage={saveError}
      readOnly={readOnly}
    />
  );
}
