"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toStudents } from "@/features/host/live/adapt";
import { LobbyPage } from "@/features/host/live/lobby-page";
import { useRoomByPin } from "@/lib/queries/use-rooms";
import { useStartSession } from "@/lib/queries/use-session-control";
import { useSessionStore } from "@/lib/stores/session-store";
import { AppError } from "@/lib/types/app-error";

/** 문제 세트가 확정되지 않아 시작할 수 없을 때 (409) */
const SET_NOT_CONFIRMED_MESSAGE = "문제 세트를 먼저 확정해 주세요";

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

  const phase = useSessionStore((s) => s.phase);
  const participants = useSessionStore((s) => s.participants);
  const setAiAnalysisEnabled = useSessionStore((s) => s.setAiAnalysisEnabled);

  const start = useStartSession(roomId ?? 0);

  // 시작은 서버가 알린다 — SESSION_STARTED로 phase가 바뀌면 진행 화면으로 넘어간다
  useEffect(() => {
    if (phase === "RUNNING") router.replace(`/host/rooms/${pin}/live`);
  }, [phase, pin, router]);

  const handleStart = () => {
    if (roomId === null || start.isPending) return;
    start.mutate(undefined, {
      onSuccess: (res) => setAiAnalysisEnabled(res.aiAnalysisEnabled ?? true),
    });
  };

  if (room.isPending) return <ScreenLoading />;
  if (room.isError)
    return <ScreenError message={room.error.message} onRetry={() => room.refetch()} />;

  const errorMessage = start.isError
    ? AppError.isAppError(start.error) && start.error.kind === "Conflict"
      ? SET_NOT_CONFIRMED_MESSAGE
      : start.error.message
    : null;

  return (
    <LobbyPage
      pin={room.data.pin}
      title={room.data.title}
      students={toStudents(participants)}
      onStart={handleStart}
      starting={start.isPending}
      errorMessage={errorMessage}
    />
  );
}
