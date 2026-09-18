"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ReconnectingBanner } from "@/components/common/reconnecting-banner";
import { ScreenError } from "@/components/common/screen-error";
import { AppError } from "@/lib/types/app-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toStudents } from "@/features/host/live/adapt";
import {
  exitPathFor,
  toLiveQuestion,
  toMyRankChip,
  toScoreView,
} from "@/features/participant/play/adapt";
import { WaitingPage } from "@/features/participant/play/waiting-page";
import { PlayPage } from "@/features/participant/play/play-page";
import { clearMyParticipant, readMyParticipant } from "@/lib/my-participant";
import { useLeaveRoom, useParticipants, useRoomByPin } from "@/lib/queries/use-rooms";
import { toSubmitAnswerMessage, useSubmitAnswer } from "@/lib/queries/use-session-control";
import { useSessionConnection } from "@/lib/queries/use-session-connection";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useSessionStore } from "@/lib/stores/session-store";

const NO_SUBSCRIBE = () => () => {};
const readMyName = () => readMyParticipant()?.nickname ?? null;
const readMyId = () => readMyParticipant()?.participantId ?? null;
const readOnServer = () => null;

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
  const reveal = useSessionStore((s) => s.reveal);
  const ranking = useSessionStore((s) => s.ranking);
  const hints = useSessionStore((s) => s.hints);
  const screenLocked = useSessionStore((s) => s.screenLocked);
  const connection = useSessionStore((s) => s.connection);

  /**
   * 대기실 명단은 폴링 + 입·퇴장 이벤트로 갱신한다 — 폴링은 탭이 뒤에 있으면 멈추므로
   * `PARTICIPANT_JOINED`·`PARTICIPANT_LEFT`로 스토어 명단이 바뀌면 서버 명단을 다시 읽는다.
   * 시작하면 폴링을 끄고 문항 화면이 이벤트로 움직인다.
   */
  const participantList = useParticipants(roomId, { poll: phase === "WAITING" });
  const participants = participantList.data ?? [];
  const liveParticipantCount = useSessionStore((s) => s.participants.length);
  const refetchParticipants = participantList.refetch;
  useEffect(() => {
    if (roomId !== null && phase === "WAITING") void refetchParticipants();
  }, [liveParticipantCount, roomId, phase, refetchParticipants]);

  const submitAnswer = useSubmitAnswer(roomId ?? 0);
  // sessionStorage는 서버 렌더에 없다. 렌더 중에 그냥 읽으면 하이드레이션이 어긋나므로
  // 서버 스냅샷을 null로 둔다 — 값은 참여 시점에 한 번 쓰이고 바뀌지 않아 구독은 빈 함수로 충분하다.
  const myName = useSyncExternalStore(NO_SUBSCRIBE, readMyName, readOnServer);
  const myParticipantId = useSyncExternalStore(NO_SUBSCRIBE, readMyId, readOnServer);

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

  // 이전 문항의 제출 실패 문구가 다음 문항까지 남지 않게 뮤테이션 상태도 문항마다 비운다
  const resetSubmit = submitAnswer.reset;
  const currentQuestionId = currentQuestion?.questionId ?? null;
  useEffect(() => {
    resetSubmit();
  }, [currentQuestionId, resetSubmit]);

  useEffect(() => {
    if (phase === "FINISHED" && roomId !== null) router.replace(`/result/${roomId}`);
  }, [phase, roomId, router]);

  // 끝난 방(410)·없는 방(404)은 입장 화면에 머물 이유가 없다 — 세션이 끝났으니 메인으로
  // (시나리오 테스트 "세션 종료 후 뒤로가기 시 입장 완료 화면 유지", 2026-09-08)
  const roomGone =
    room.isError &&
    AppError.isAppError(room.error) &&
    (room.error.status === 410 || room.error.kind === "NotFound");
  useEffect(() => {
    if (roomGone) router.replace(exitPathFor(isMember));
  }, [roomGone, isMember, router]);

  const leave = useLeaveRoom(roomId);
  const [confirmLeave, setConfirmLeave] = useState(false);

  /**
   * 방에서 나간다(앱 M-02 · M-03 "나가기"). **요청이 실패해도 화면은 나간다** — 앱과 같다.
   * 나가려는 사람을 오프라인 오류로 방에 붙잡아 둘 이유가 없다. 게스트 Bearer는 성공했을 때만
   * 훅이 지우므로, 실패했으면 같은 탭에서 다시 들어올 여지가 남는다.
   * 실시간 연결은 화면을 벗어나며 useSessionConnection 정리가 끊는다.
   */
  const exitRoom = () => {
    if (leave.isPending) return;
    leave.mutate(undefined, {
      onSettled: () => {
        clearMyParticipant();
        router.replace(exitPathFor(isMember));
      },
    });
  };

  if (room.isPending) return <ScreenLoading />;
  // 메인으로 보내는 중에는 오류 화면 대신 로딩만 — "없거나 끝난 방" 문구가 깜빡이지 않게
  if (roomGone) return <ScreenLoading />;
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
          // 시작 전이라 잃을 답안이 없다 — 앱처럼 확인 없이 바로 나간다
          onLeave={exitRoom}
          leaving={leave.isPending}
        />
      );
    }

    // RUNNING인데 아직 첫 문항이 도착하지 않은 짧은 순간
    if (!currentQuestion) return <ScreenLoading />;

    // 제출 수는 서버가 학생에게 알려주지 않는다(호스트 토픽 전용) — 내 순위는 랭킹에서 찾는다
    const question = toLiveQuestion(currentQuestion, 0);
    const latestHint = hints.length > 0 ? hints[hints.length - 1] : null;
    // 마감 결과는 **지금 열려 있는 문항의 것**일 때만 — 늦게 온 이전 문항 마감은 리듀서가 버리지만 한 번 더 지킨다
    const currentReveal =
      reveal && reveal.sessionQuestionId === currentQuestion.sessionQuestionId ? reveal : null;
    // 제출 응답(서버 채점)을 그대로 점수 카드로 — 뮤테이션 결과가 원본이라 따로 보관하지 않는다
    const score = toScoreView(submitAnswer.data, currentQuestion.sessionQuestionId);

    /**
     * 화면이 주는 값이 곧 서버가 받는 값이다 — 고른 보기의 **원문**, 서술형은 본문.
     * 예전에는 여기서 한 번 더 키(A·B·C·D)로 되찾았는데 화면이 이미 원문을 넘기고 있어서,
     * 보기 문구가 키를 닮으면 **다른 보기가 제출됐다**(QA_BACKLOG F-5).
     */
    const handleSubmit = (submitted: string) => {
      if (roomId === null || submitAnswer.isPending) return;
      submitAnswer.mutate(
        {
          questionId: currentQuestion.questionId,
          submitted,
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
        score={score}
        // 폰 폭 문항 결과의 "현재 N위 ▲n" — 참가 기록이 없어 내가 누구인지 모르면 칩을 감춘다
        rankChip={toMyRankChip(ranking, myParticipantId)}
        reveal={currentReveal}
        isLocked={screenLocked}
        hint={latestHint}
        errorMessage={submitAnswer.isError ? toSubmitAnswerMessage(submitAnswer.error) : null}
        onLeave={() => setConfirmLeave(true)}
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
      {/* 진행 중 나가기 확인 — 문구는 앱 M-03(PlayScreen)과 같다 */}
      <ConfirmDialog
        open={confirmLeave}
        onOpenChange={setConfirmLeave}
        title="방을 나갈까요?"
        description="진행 중인 세션에서 나가면 남은 문항을 풀 수 없어요."
        confirmLabel="나가기"
        pending={leave.isPending}
        onConfirm={exitRoom}
      />
    </>
  );
}
