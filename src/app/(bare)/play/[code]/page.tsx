"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import { ReconnectingBanner } from "@/components/common/reconnecting-banner";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toStudents } from "@/features/host/live/adapt";
import { toLiveQuestion, toSubmittedValue } from "@/features/participant/play/adapt";
import { WaitingPage } from "@/features/participant/play/waiting-page";
import { PlayPage } from "@/features/participant/play/play-page";
import { readMyParticipant } from "@/lib/my-participant";
import { useParticipants, useRoomByPin } from "@/lib/queries/use-rooms";
import { toSubmitAnswerMessage, useSubmitAnswer } from "@/lib/queries/use-session-control";
import { useSessionConnection } from "@/lib/queries/use-session-connection";
import { useAuthStore } from "@/lib/stores/auth-store";
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
  const roomId = room.data?.id ?? null;
  // 회원으로 들어왔으면 기록이 계정에 남는다 — 게스트에게는 그 약속을 하지 않는다
  const isMember = useAuthStore((s) => s.status) === "authenticated";

  const { reconnect } = useSessionConnection(roomId, { isHost: false });

  const phase = useSessionStore((s) => s.phase);
  const currentQuestion = useSessionStore((s) => s.currentQuestion);
  const submitted = useSessionStore((s) => s.submitted);
  const ranking = useSessionStore((s) => s.ranking);
  const hints = useSessionStore((s) => s.hints);
  const screenLocked = useSessionStore((s) => s.screenLocked);
  const connection = useSessionStore((s) => s.connection);

  /**
   * 대기실 명단은 **폴링**으로 갱신한다 — 서버가 참가자 입·퇴장 이벤트를 발행하지 않는다
   * (백엔드 질문 B-1). 시작하면 폴링을 끄고 문항 화면이 이벤트로 움직인다.
   */
  const participantList = useParticipants(roomId, { poll: phase === "WAITING" });
  const participants = participantList.data ?? [];

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
          isMember={isMember}
        />
      );
    }

    // RUNNING인데 아직 첫 문항이 도착하지 않은 짧은 순간
    if (!currentQuestion) return <ScreenLoading />;

    // 제출 수는 서버가 학생에게 알려주지 않는다(호스트 토픽 전용) — 내 순위는 랭킹에서 찾는다
    const question = toLiveQuestion(currentQuestion, 0);
    const latestHint = hints.length > 0 ? hints[hints.length - 1] : null;

    /**
     * 화면이 주는 값은 보기 키(A·B·C·D)나 서술형 본문이다.
     * 서버는 **보기 원문**을 받으므로 여기서 바꿔 보낸다.
     */
    const handleSubmit = (choiceKeyOrText: string) => {
      if (roomId === null || submitAnswer.isPending) return;
      submitAnswer.mutate(
        {
          questionId: currentQuestion.questionId,
          submitted: toSubmittedValue(question, choiceKeyOrText),
        },
        { onSuccess: () => setSubmittedQuestionId(currentQuestion.questionId) },
      );
    };

    return (
      <PlayPage
        question={question}
        onSubmit={handleSubmit}
        submitting={submitAnswer.isPending}
        hasSubmitted={submitted || submittedQuestionId === currentQuestion.questionId}
        isLocked={screenLocked}
        hint={latestHint}
        errorMessage={submitAnswer.isError ? toSubmitAnswerMessage(submitAnswer.error) : null}
      />
    );
  };

  return (
    <>
      {/*
        07 보드 "실시간 재연결" — 끊긴 동안에도 화면을 덮거나 갈아 끼우지 않고 맨 위 얇은 띠로만
        알린다. 쓰던 서술형 답안을 언마운트로 잃지 않는 것이 이 규칙을 따르는 실질적인 이유다.
        학생 화면은 호스트와 달리 10초가 지나도 오류 화면으로 넘기지 않는다 — 답안이 날아간다.
      */}
      {connection === "reconnecting" && (
        <div className="fixed inset-x-0 top-0 z-50">
          <ReconnectingBanner onRetry={reconnect} />
        </div>
      )}
      {stage()}
    </>
  );
}
