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
import {
  useHostRoomId,
  useKickParticipant,
  useParticipants,
  useRoom,
  useUpdateRoom,
} from "@/lib/queries/use-rooms";
import { toSessionControlMessage, useStartSession } from "@/lib/queries/use-session-control";
import { useSessionStore } from "@/lib/stores/session-store";

/**
 * W-04 대기실 컨테이너. 실시간 연결은 상위 [code] 레이아웃이 잡고, 여기서는 스토어를 읽어
 * 참가자를 그리고 세션 시작 요청만 보낸다 — 화면 전환은 서버 이벤트(phase)가 결정한다.
 */
export default function Page() {
  const params = useParams<{ code: string }>();
  const pin = params.code;
  const router = useRouter();

  const room = useHostRoomId(pin);
  const roomId = room.roomId;
  // PIN 조회 응답에는 호스트용 정보(연결된 세트·정원)가 없다 — 방 상세를 따로 읽는다
  const detail = useRoom(roomId);
  const confirmedSets = useQuestionSets({ status: "CONFIRMED" });
  const linkSet = useUpdateRoom();
  const [setIdToLink, setSetIdToLink] = useState("");

  const phase = useSessionStore((s) => s.phase);

  /**
   * 대기실 명단은 **폴링**으로 갱신한다 — 서버가 `PARTICIPANT_JOINED`·`PARTICIPANT_LEFT`를
   * 발행하지 않아 실시간으로 받을 방법이 없다(백엔드 질문 B-1). 시작하면 폴링을 끈다.
   */
  const participantList = useParticipants(roomId, { poll: phase === "WAITING" });
  const participants = participantList.data ?? [];
  const kick = useKickParticipant();

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
    // 시작 응답은 204다 — 화면 전환은 뒤따라오는 SESSION_STARTED 이벤트가 만든다
    start.mutate();
  };

  // 아무도 없을 때 시작을 누르면 한 번 되묻는다 — 늦게 들어온 학생은 앞 문항을 못 푼다.
  const handleStart = () => {
    if (participants.length === 0) {
      setConfirmEmptyStart(true);
      return;
    }
    startSession();
  };

  // 방 상세는 roomId가 나오기 전까지 `enabled: false`이고 그 상태도 `isPending`이다 —
  // pending을 한 줄로 묶으면 잘못된 PIN(= PIN 조회 실패)에 에러 대신 로딩만 돈다.
  if (room.isPending) return <ScreenLoading />;
  if (room.error) return <ScreenError message={room.error.message} />;
  if (detail.isPending) return <ScreenLoading />;
  if (detail.isError)
    return <ScreenError message={detail.error.message} onRetry={() => detail.refetch()} />;

  const errorMessage = start.isError ? toSessionControlMessage(start.error) : null;

  const needsSet = detail.data.questionSetId === undefined;
  // 연결된 세트의 문항 수 — 방 응답에는 없지만 이미 읽어 둔 확정 세트 목록에서 찾을 수 있다
  const linkedSet = confirmedSets.data?.content.find((s) => s.id === detail.data.questionSetId);
  const handleLinkSet = () => {
    if (setIdToLink === "" || linkSet.isPending) return;
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
        pin={detail.data.pin}
        title={detail.data.title}
        dateLabel={detail.data.scheduledAt ? formatDotDateWithDay(detail.data.scheduledAt) : null}
        // 방 응답에 호스트 이름이 없다(hostUserId만 준다) — 지금 보는 사람이 호스트이므로 굳이 쓰지 않는다
        hostName={null}
        students={toStudents(participants)}
        questionCount={linkedSet?.questionCount ?? null}
        // 문항당 제한 시간은 문항마다 다르다 — 세트 요약의 예상 시간을 문항 수로 나눠 쓰지 않고 비워 둔다
        timeLimitSec={null}
        isPaid={detail.data.type === "PAID"}
        maxParticipants={detail.data.maxParticipants ?? null}
        onStart={handleStart}
        starting={start.isPending}
        errorMessage={errorMessage}
        onKick={(studentId) => {
          if (roomId === null || kick.isPending) return;
          kick.mutate({ roomId, participantId: Number(studentId) });
        }}
        kickingId={kick.isPending ? String(kick.variables.participantId) : null}
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
