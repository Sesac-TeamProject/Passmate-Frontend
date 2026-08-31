"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import {
  firstErrorMessage,
  toQuestionResult,
  toRankedStudents,
  toStudents,
} from "@/features/host/live/adapt";
import { ResultPage } from "@/features/host/live/result-page";
import { useRoomByPin } from "@/lib/queries/use-rooms";
import { useEndSession, useNextQuestion, useSubmissions } from "@/lib/queries/use-session-control";
import { useSessionStore } from "@/lib/stores/session-store";

/**
 * W-06 문항 결과 컨테이너. 실시간 연결은 상위 [code] 레이아웃이 잡는다.
 * 다음 문항이 시작되면(reveal이 지워지면) 진행 화면으로, 세션이 끝나면 리포트로 서버 이벤트가 보낸다.
 */
export default function Page() {
  const params = useParams<{ code: string }>();
  const pin = params.code;
  const router = useRouter();

  const room = useRoomByPin(pin);
  const roomId = room.data?.roomId ?? null;

  const phase = useSessionStore((s) => s.phase);
  const reveal = useSessionStore((s) => s.reveal);
  const ranking = useSessionStore((s) => s.ranking);
  const participants = useSessionStore((s) => s.participants);
  const currentQuestion = useSessionStore((s) => s.currentQuestion);
  const questionCount = useSessionStore((s) => s.questionCount);
  const snapshotTs = useSessionStore((s) => s.snapshotTs);

  const submissions = useSubmissions(roomId, phase === "RUNNING");
  const next = useNextQuestion(roomId ?? 0);
  const end = useEndSession(roomId ?? 0);

  useEffect(() => {
    if (roomId === null) return;
    if (phase === "FINISHED") router.replace(`/host/sessions/${roomId}/review`);
    // 스냅샷까지 받고도 WAITING이면 아직 시작 전이다(주소로 바로 들어온 경우) — 대기실로 돌려보낸다
    else if (snapshotTs !== null && phase === "WAITING") router.replace(`/host/rooms/${pin}/lobby`);
    // 다음 문항이 시작되면 reveal이 지워진다 — 새로고침으로 reveal이 없을 때도 진행 화면이 맞다
    else if (reveal === null && phase === "RUNNING") router.replace(`/host/rooms/${pin}/live`);
  }, [phase, reveal, snapshotTs, roomId, pin, router]);

  if (room.isPending) return <ScreenLoading />;
  if (room.isError)
    return <ScreenError message={room.error.message} onRetry={() => room.refetch()} />;

  // 공개할 정답이 없으면 위 effect가 진행 화면·리포트로 보낸다
  if (reveal === null) return <ScreenLoading />;

  const students = ranking.length > 0 ? toRankedStudents(ranking) : toStudents(participants);

  return (
    <ResultPage
      questionIndex={reveal.questionNo}
      questionTotal={questionCount ?? reveal.questionNo}
      result={toQuestionResult(reveal, submissions.data, ranking, currentQuestion)}
      students={students}
      isLastQuestion={questionCount !== null && reveal.questionNo === questionCount}
      onNext={() => next.mutate()}
      onEndSession={() => end.mutate()}
      pending={next.isPending || end.isPending}
      errorMessage={firstErrorMessage(next.error, end.error)}
    />
  );
}
