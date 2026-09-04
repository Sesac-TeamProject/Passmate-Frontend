"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { firstErrorMessage, toSolvingStudents, toSubmittedCount } from "@/features/host/live/adapt";
import { LivePage } from "@/features/host/live/live-page";
import { ProjectorDisconnected } from "@/features/host/live/projector-disconnected";
import { useDisconnectedTooLong } from "@/features/host/live/use-disconnected-too-long";
// 문항 → 뷰 타입 변환은 학생 화면과 같은 함수를 쓴다(중복 정의 금지)
import { choicesOf, toLiveQuestion } from "@/features/participant/play/adapt";
import { useHostRoomId } from "@/lib/queries/use-rooms";
import {
  useEndCurrentQuestion,
  useEndSession,
  useLockScreen,
  useNextQuestion,
  useSubmissions,
  useUploadVoiceHint,
} from "@/lib/queries/use-session-control";
import { useSessionStore } from "@/lib/stores/session-store";

/** 제출 현황 폴링 간격 — 프로젝터가 벽에 떠 있는 동안 계속 돈다 */
const SUBMISSIONS_POLL_MS = 3000;

/**
 * W-05 진행 컨테이너. 실시간 연결은 상위 [code] 레이아웃이 잡는다.
 * 버튼은 REST 요청만 보내고, 화면 전환은 서버 이벤트(reveal·phase)가 결정한다.
 */
export default function Page() {
  const params = useParams<{ code: string }>();
  const pin = params.code;
  const router = useRouter();

  const room = useHostRoomId(pin);
  const roomId = room.roomId;

  const phase = useSessionStore((s) => s.phase);
  const currentQuestion = useSessionStore((s) => s.currentQuestion);
  const totalCount = useSessionStore((s) => s.totalCount);
  const participants = useSessionStore((s) => s.participants);
  const submission = useSessionStore((s) => s.submission);
  const reveal = useSessionStore((s) => s.reveal);
  const screenLocked = useSessionStore((s) => s.screenLocked);
  const connection = useSessionStore((s) => s.connection);
  const snapshotTs = useSessionStore((s) => s.snapshotTs);

  /**
   * 제출 집계는 호스트 토픽의 `SUBMISSION_UPDATED`로 실시간으로 온다.
   * 폴링은 이벤트를 놓쳤을 때를 위한 보조라 간격을 넉넉히 둔다 — 값은 스토어(이벤트)를 먼저 본다.
   */
  const submissions = useSubmissions(roomId, phase === "RUNNING", SUBMISSIONS_POLL_MS);
  const submissionStatus = submission ?? submissions.data ?? null;
  const next = useNextQuestion(roomId ?? 0);
  const endCurrent = useEndCurrentQuestion(roomId ?? 0);
  const end = useEndSession(roomId ?? 0);
  const lock = useLockScreen(roomId ?? 0);
  const hint = useUploadVoiceHint(roomId ?? 0);
  const [hintError, setHintError] = useState<string | null>(null);
  // 잠깐 끊긴 것과 복구 실패를 시간으로 가른다 — 07 보드 "10초 넘으면 오류 화면으로"
  const disconnected = connection !== "connected";
  const disconnectedTooLong = useDisconnectedTooLong(disconnected);

  useEffect(() => {
    if (roomId === null) return;
    // 세션이 끝났으면 리포트로, 문항이 마감돼 정답이 공개되면 결과 화면으로
    if (phase === "FINISHED") router.replace(`/host/rooms/${pin}/final`);
    else if (reveal !== null) router.replace(`/host/rooms/${pin}/result`);
    // 스냅샷까지 받고도 WAITING이면 아직 시작 전이다(주소로 바로 들어온 경우) — 대기실로 돌려보낸다
    else if (snapshotTs !== null && phase === "WAITING") router.replace(`/host/rooms/${pin}/lobby`);
  }, [phase, reveal, snapshotTs, roomId, pin, router]);

  if (room.isPending) return <ScreenLoading />;
  if (room.error) return <ScreenError message={room.error.message} />;

  // 10초가 지나도 안 붙으면 W-05e로 넘긴다. 문항이 아직 없어도 마찬가지 —
  // 벽에 걸린 프로젝터가 "여는 중"에서 멈춰 있는 것보다 끊겼다고 말해 주는 편이 낫다.
  if (disconnectedTooLong)
    return (
      <ProjectorDisconnected
        pin={pin}
        current={currentQuestion?.orderNo ?? 1}
        total={totalCount || 1}
        // 연결은 상위 [code] 레이아웃이 잡아 reconnect를 넘겨받을 수 없다.
        // 레이아웃 주석대로 새로고침하면 스냅샷으로 이어지므로, 시안 각주("같은 주소를 다시 열면
        // 자동으로 이어집니다")와도 같은 동작이다.
        onRetry={() => window.location.reload()}
      />
    );

  // 시작 직후(SESSION_STARTED ~ 첫 QUESTION_STARTED)와 종료 직후에는 보여줄 문항이 없다
  if (!currentQuestion || phase !== "RUNNING")
    return <ScreenLoading label="문항을 여는 중이에요…" />;

  const submittedCount = toSubmittedCount(submissionStatus, participants.length);
  const question = toLiveQuestion(currentQuestion, submittedCount.submittedCount);
  const pending = next.isPending || endCurrent.isPending || end.isPending || lock.isPending;
  const errorMessage =
    hintError ?? firstErrorMessage(next.error, endCurrent.error, end.error, lock.error, hint.error);

  return (
    <LivePage
      question={question}
      // 보기별 제출 수는 **보기 원문이 키인 맵**으로 온다 — 문항의 보기 순서대로 꺼낸다
      counts={choicesOf(currentQuestion).map((text) => submissionStatus?.distribution[text] ?? 0)}
      students={toSolvingStudents(participants)}
      isLocked={screenLocked}
      isLastQuestion={currentQuestion.orderNo === currentQuestion.totalCount}
      onNext={() => next.mutate()}
      onEndCurrent={() => endCurrent.mutate()}
      onEndSession={() => end.mutate()}
      onToggleLock={() => lock.mutate(!screenLocked)}
      onHint={(clip, durationMs) => {
        setHintError(null);
        hint.mutate({ clip, durationMs });
      }}
      onHintError={setHintError}
      hintUploading={hint.isPending}
      pending={pending}
      reconnecting={disconnected}
      errorMessage={errorMessage}
    />
  );
}
