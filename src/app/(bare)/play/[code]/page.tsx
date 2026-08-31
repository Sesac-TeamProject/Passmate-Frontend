"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toLiveQuestion } from "@/features/participant/play/adapt";
import { PlayPage } from "@/features/participant/play/play-page";
import { useRoomByPin } from "@/lib/queries/use-rooms";
import { useSubmitAnswer } from "@/lib/queries/use-session-control";
import { useSessionConnection } from "@/lib/queries/use-session-connection";
import { useSessionStore } from "@/lib/stores/session-store";

/** P-Web 학생 풀이 컨테이너. PIN → roomId 조회 → 실시간 세션 연결, 스토어는 selector로만 읽는다. */
export default function Page() {
  const params = useParams<{ code: string }>();
  const pin = params.code;
  const router = useRouter();

  const room = useRoomByPin(pin);
  const roomId = room.data?.roomId ?? null;

  useSessionConnection(roomId, { isHost: false });

  const phase = useSessionStore((s) => s.phase);
  const currentQuestion = useSessionStore((s) => s.currentQuestion);
  const questionCount = useSessionStore((s) => s.questionCount);
  const serverTs = useSessionStore((s) => s.serverTs);
  const participants = useSessionStore((s) => s.participants);
  const submitted = useSessionStore((s) => s.submitted);
  const hints = useSessionStore((s) => s.hints);
  const isLocked = useSessionStore((s) => s.isLocked);

  const submitAnswer = useSubmitAnswer(roomId ?? 0);
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

  // 세션이 끝났으면 위 effect가 결과 화면으로 보낸다 — 그 사이 화면은 로딩으로만 보인다
  if (phase === "FINISHED") return <ScreenLoading />;

  if (phase === "WAITING") {
    return (
      // TODO(design): DESIGN_GAPS A-2 — 학생 웹 대기실 시안 없음, 임시 배치
      <main
        role="status"
        aria-live="polite"
        className="flex min-h-screen flex-col items-center justify-center gap-2 p-10 text-center"
      >
        <p className="text-heading-sm text-ink">선생님이 시작하면 자동으로 넘어가요</p>
        <p className="text-body-md text-muted-foreground">참가자 {participants.length}명</p>
      </main>
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
}
