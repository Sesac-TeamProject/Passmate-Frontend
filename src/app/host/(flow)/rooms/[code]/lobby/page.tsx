"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toStudents } from "@/features/host/live/adapt";
import { LobbyPage } from "@/features/host/live/lobby-page";
import { toQuestionSetOptions } from "@/features/host/room-flow/adapt";
import { formatDotDateWithDay } from "@/lib/format";
import { useQuestionSets } from "@/lib/queries/use-question-sets";
import { useRoom, useRoomByPin, useUpdateRoom } from "@/lib/queries/use-rooms";
import { useStartSession } from "@/lib/queries/use-session-control";
import { useSessionStore } from "@/lib/stores/session-store";
import { AppError } from "@/lib/types/app-error";

/** 확정 세트가 연결되지 않아 시작할 수 없을 때 (409 QUESTION_SET_REQUIRED) */
const SET_REQUIRED_MESSAGE = "확정한 문제 세트를 먼저 연결해 주세요";

/**
 * W-04 대기실 컨테이너. 실시간 연결은 상위 [code] 레이아웃이 잡고, 여기서는 스토어를 읽어
 * 참가자를 그리고 세션 시작 요청만 보낸다 — 화면 전환은 서버 이벤트(phase)가 결정한다.
 */
export default function Page() {
  const params = useParams<{ code: string }>();
  const pin = params.code;
  const router = useRouter();

  const room = useRoomByPin(pin);
  const roomId = room.data?.roomId ?? null;
  // PIN 조회 응답에는 호스트용 정보(연결된 세트·정원)가 없다 — 방 상세를 따로 읽는다
  const detail = useRoom(roomId);
  const confirmedSets = useQuestionSets({ status: "CONFIRMED" });
  const linkSet = useUpdateRoom();
  const [setIdToLink, setSetIdToLink] = useState("");

  const phase = useSessionStore((s) => s.phase);
  const participants = useSessionStore((s) => s.participants);
  const setAiAnalysisEnabled = useSessionStore((s) => s.setAiAnalysisEnabled);

  const start = useStartSession(roomId ?? 0);
  // W-04 "아직 아무도 안 들어왔어요" — 계약 없이 화면에서만 막는 실수 방지 확인
  const [confirmEmptyStart, setConfirmEmptyStart] = useState(false);

  // 시작은 서버가 알린다 — SESSION_STARTED로 phase가 바뀌면 진행 화면으로 넘어간다
  useEffect(() => {
    if (phase === "RUNNING") router.replace(`/host/rooms/${pin}/live`);
  }, [phase, pin, router]);

  const startSession = () => {
    if (roomId === null || start.isPending) return;
    setConfirmEmptyStart(false);
    start.mutate(undefined, {
      onSuccess: (res) => setAiAnalysisEnabled(res.aiAnalysisEnabled ?? true),
    });
  };

  // 아무도 없을 때 시작을 누르면 한 번 되묻는다 — 늦게 들어온 학생은 앞 문항을 못 푼다.
  const handleStart = () => {
    if (participants.length === 0) {
      setConfirmEmptyStart(true);
      return;
    }
    startSession();
  };

  if (room.isPending) return <ScreenLoading />;
  if (room.isError)
    return <ScreenError message={room.error.message} onRetry={() => room.refetch()} />;

  const errorMessage = start.isError
    ? AppError.isAppError(start.error) && start.error.kind === "Conflict"
      ? SET_REQUIRED_MESSAGE
      : start.error.message
    : null;

  const needsSet = detail.data !== undefined && detail.data.questionSetId === undefined;
  const handleLinkSet = () => {
    if (!detail.data || setIdToLink === "" || linkSet.isPending) return;
    linkSet.mutate({
      roomId: detail.data.id,
      body: {
        title: detail.data.title,
        questionSetId: Number(setIdToLink),
        isPublic: detail.data.isPublic,
      },
    });
  };

  return (
    <>
      <LobbyPage
        pin={room.data.pin}
        title={room.data.title}
        dateLabel={room.data.scheduledAt ? formatDotDateWithDay(room.data.scheduledAt) : null}
        hostName={room.data.host?.nickname ?? null}
        students={toStudents(participants)}
        questionCount={room.data.questionCount ?? null}
        // TODO(API): 문항당 제한 시간은 RoomInfoResponse에 없다 — DESIGN_GAPS D-6(호스트용 방 상세)에 묶여 있어
        // 계약이 오기 전까지 메타 통계에서 "—"로 비워 둔다.
        timeLimitSec={null}
        isPaid={room.data.isPaid ?? false}
        maxParticipants={room.data.maxParticipants ?? null}
        onStart={handleStart}
        starting={start.isPending}
        errorMessage={errorMessage}
        setLink={
          needsSet
            ? {
                options: toQuestionSetOptions(confirmedSets.data?.content ?? []),
                value: setIdToLink,
                onChange: setSetIdToLink,
                onSubmit: handleLinkSet,
                pending: linkSet.isPending,
                errorMessage: linkSet.isError ? linkSet.error.message : null,
              }
            : null
        }
      />
      <ConfirmDialog
        open={confirmEmptyStart}
        onOpenChange={setConfirmEmptyStart}
        title="아직 아무도 안 들어왔어요"
        description="지금 시작하면 늦게 들어온 학생은 진행 중인 문항부터 풀게 돼요."
        cancelLabel="조금 더 기다리기"
        confirmLabel="그래도 시작"
        pending={start.isPending}
        onConfirm={startSession}
      />
    </>
  );
}
