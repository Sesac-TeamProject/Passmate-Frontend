"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toStudents } from "@/features/host/live/adapt";
import { toLiveQuestion } from "@/features/participant/play/adapt";
import { DisconnectedOverlay } from "@/features/participant/play/disconnected-overlay";
import { WaitingPage } from "@/features/participant/play/waiting-page";
import { PlayPage } from "@/features/participant/play/play-page";
import { readMyParticipant } from "@/lib/my-participant";
import { useRoomByPin } from "@/lib/queries/use-rooms";
import { useSubmitAnswer } from "@/lib/queries/use-session-control";
import { useSessionConnection } from "@/lib/queries/use-session-connection";
import { useSessionStore } from "@/lib/stores/session-store";

const NO_SUBSCRIBE = () => () => {};
const readMyName = () => readMyParticipant()?.nickname ?? null;
const readMyNameOnServer = () => null;

/** P-Web 학생 풀이 컨테이너. PIN → roomId 조회 → 실시간 세션 연결, 스토어는 selector로만 읽는다. */
export default function Page() {
  const params = useParams<{ code: string }>();
  const pin = params.code;
  const router = useRouter();

  const room = useRoomByPin(pin);
  const roomId = room.data?.roomId ?? null;

  const { reconnect } = useSessionConnection(roomId, { isHost: false });

  const phase = useSessionStore((s) => s.phase);
  const currentQuestion = useSessionStore((s) => s.currentQuestion);
  const questionCount = useSessionStore((s) => s.questionCount);
  const serverTs = useSessionStore((s) => s.serverTs);
  const participants = useSessionStore((s) => s.participants);
  const submitted = useSessionStore((s) => s.submitted);
  const hints = useSessionStore((s) => s.hints);
  const isLocked = useSessionStore((s) => s.isLocked);
  const connection = useSessionStore((s) => s.connection);

  const submitAnswer = useSubmitAnswer(roomId ?? 0);
  // sessionStorage는 서버 렌더에 없다. 렌더 중에 그냥 읽으면 하이드레이션이 어긋나므로
  // 서버 스냅샷을 null로 둔다 — 값은 참여 시점에 한 번 쓰이고 바뀌지 않아 구독은 빈 함수로 충분하다.
  const myName = useSyncExternalStore(NO_SUBSCRIBE, readMyName, readMyNameOnServer);

  const [submittedQuestionId, setSubmittedQuestionId] = useState<number | null>(null);
  const [syncedQuestionId, setSyncedQuestionId] = useState<number | null>(
    currentQuestion?.questionId ?? null,
  );

  // 문항이 바뀌면 이전 문항의 "제출 완료" 표시를 지운다.
  // 렌더 중 조정(react.dev "Adjusting state when a prop changes") — effect 안에서 곧바로 setState하지 않는다.
  if ((currentQuestion?.questionId ?? null) !== syncedQuestionId) {
    setSyncedQuestionId(currentQuestion?.questionId ?? null);
    setSubmittedQuestionId(null);
  }

  useEffect(() => {
    if (phase === "FINISHED" && roomId !== null) router.replace(`/result/${roomId}`);
  }, [phase, roomId, router]);

  if (room.isPending) return <ScreenLoading />;
  if (room.isError)
    return <ScreenError message={room.error.message} onRetry={() => room.refetch()} />;

  const stage = () => {
    // 세션이 끝났으면 위 effect가 결과 화면으로 보낸다 — 그 사이 화면은 로딩으로만 보인다
    if (phase === "FINISHED") return <ScreenLoading />;

    if (phase === "WAITING") {
      return (
        <WaitingPage
          roomTitle={room.data.title}
          pin={pin}
          myName={myName}
          students={toStudents(participants)}
        />
      );
    }

    // RUNNING인데 아직 첫 문항이 도착하지 않은 짧은 순간
    if (!currentQuestion) return <ScreenLoading />;

    const question = toLiveQuestion(currentQuestion, questionCount, serverTs, submitted);
    const latestHint = hints.length > 0 ? hints[hints.length - 1] : null;

    const handleSubmit = (content: string) => {
      if (roomId === null || submitAnswer.isPending) return;
      submitAnswer.mutate(
        { questionId: currentQuestion.questionId, content },
        { onSuccess: () => setSubmittedQuestionId(currentQuestion.questionId) },
      );
    };

    return (
      <PlayPage
        question={question}
        onSubmit={handleSubmit}
        submitting={submitAnswer.isPending}
        hasSubmitted={submittedQuestionId === currentQuestion.questionId}
        isLocked={isLocked}
        hint={latestHint}
      />
    );
  };

  return (
    <>
      {stage()}
      {/* 끊긴 동안에도 화면을 갈아 끼우지 않고 겹친다 — 쓰던 서술형 답안을 잃지 않는다 */}
      {connection === "reconnecting" && <DisconnectedOverlay onRetry={reconnect} />}
    </>
  );
}
