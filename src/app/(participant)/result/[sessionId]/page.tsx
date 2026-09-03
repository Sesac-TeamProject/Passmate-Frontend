"use client";

import { useState, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toRankedStudents } from "@/features/host/live/adapt";
import {
  toRatingDeadlineLabel,
  toRatingNotice,
  toRatingSubmitMessage,
} from "@/features/participant/result/adapt";
import {
  FinalResultPage,
  type PodiumEntry,
  type PodiumPlace,
  type RankRow,
} from "@/features/participant/result/final-result-page";
import { RatingSheet } from "@/features/participant/result/rating-sheet";
import { readMyParticipant } from "@/lib/my-participant";
import { useSessionConnection } from "@/lib/queries/use-session-connection";
import { useSubmitRating } from "@/lib/queries/use-ratings";
import { useMyResult } from "@/lib/queries/use-results";
import { readGuestRecord } from "@/lib/guest-token-storage";
import { useClaimGuestRecord } from "@/lib/queries/use-me";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useSessionStore } from "@/lib/stores/session-store";

/** 순위 카드에 담는 행 수 — 시안은 3줄(1·2위 + 나) */
const ROW_LIMIT = 3;

const NO_SUBSCRIBE = () => () => {};
const readMyId = () => readMyParticipant()?.participantId ?? null;
const readMyIdOnServer = () => null;
const readGuestRecordOnServer = () => null;

/**
 * M-05 최종 결과 컨테이너.
 * 내 점수·등수는 결과 조회(GET /rooms/{id}/results/me)에서, 상위 순위는 세션 스냅샷의 랭킹에서 온다 —
 * 그래서 이 화면도 세션에 붙는다(AI 피드백이 준비되면 서버 이벤트가 결과를 무효화한다).
 */
export default function Page() {
  const params = useParams<{ sessionId: string }>();
  const roomId = Number(params.sessionId);
  const router = useRouter();

  useSessionConnection(Number.isFinite(roomId) ? roomId : null, { isHost: false });

  const finalRanking = useSessionStore((s) => s.finalRanking);
  const ranking = useSessionStore((s) => s.ranking);
  const result = useMyResult(Number.isFinite(roomId) ? roomId : null);
  const rate = useSubmitRating(roomId);
  const isMember = useAuthStore((s) => s.status) === "authenticated";
  const [rateSkipped, setRateSkipped] = useState(false);

  // sessionStorage는 서버 렌더에 없다 — 서버 스냅샷을 null로 둬 하이드레이션을 맞춘다
  const myId = useSyncExternalStore(NO_SUBSCRIBE, readMyId, readMyIdOnServer);
  /**
   * 게스트로 풀었을 때 받아 둔 이관용 표(7일). localStorage라 서버 렌더에 없다.
   * 회원으로 돌아오면 이 표로 기록 이관을 한 번 시도한다.
   * 실패해도 표를 지우지 않는다(다음 로그인에서 다시 시도된다).
   */
  const guestRecord = useSyncExternalStore(
    NO_SUBSCRIBE,
    () => (Number.isFinite(roomId) ? readGuestRecord(roomId) : null),
    readGuestRecordOnServer,
  );
  const claim = useClaimGuestRecord();
  const [claimTried, setClaimTried] = useState(false);

  if (!claimTried && isMember && guestRecord && !claim.isPending) {
    setClaimTried(true);
    claim.mutate(
      { guestToken: guestRecord.guestToken, roomId: guestRecord.roomId },
      { onError: () => undefined },
    );
  }

  if (result.isPending) return <ScreenLoading />;
  if (result.isError)
    return <ScreenError message={result.error.message} onRetry={() => result.refetch()} />;

  // P-Web 별점 시트 — 시안에 [건너뛰기]가 있다는 건 부르지 않아도 스스로 뜬다는 뜻이다.
  // 서버가 주는 `rating.available`이 문을 지킨다(안 냈거나·24시간이 지났거나·이미 냈으면 false).
  if (result.data.rating.available && !rateSkipped)
    return (
      <RatingSheet
        // TODO(계약): 결과 응답에 호스트 이름이 없다 (DESIGN_GAPS G-8)
        hostName={null}
        subtitle={[result.data.roomTitle, `${result.data.questionCount}문항`]
          .filter(Boolean)
          .join(" · ")}
        deadlineLabel={toRatingDeadlineLabel(result.data.rating)}
        onSubmit={(body) => rate.mutate(body, { onSuccess: () => setRateSkipped(true) })}
        onSkip={() => setRateSkipped(true)}
        pending={rate.isPending}
        errorMessage={rate.isError ? toRatingSubmitMessage(rate.error) : null}
      />
    );

  const source = finalRanking.length > 0 ? finalRanking : ranking;
  const students = toRankedStudents(source);

  const podium: PodiumEntry[] = source
    .filter((r) => r.rank <= 3)
    .map((r, i) => ({ rank: r.rank as PodiumPlace, student: students[i] }));

  // 참여 기록이 없으면(다른 탭·새로고침) 내 등수로 대신 찾는다
  const myRank = result.data.rank;
  const myParticipantId = myId ?? source.find((r) => r.rank === myRank)?.participantId ?? null;

  const rows: RankRow[] = source.slice(0, ROW_LIMIT).map((r, i) => ({
    rank: r.rank,
    student: students[i],
    score: r.totalScore,
    isMe: myParticipantId !== null && r.participantId === myParticipantId,
  }));

  return (
    <FinalResultPage
      myRank={myRank}
      myScore={result.data.totalScore}
      myCorrectCount={result.data.correctCount}
      questionCount={result.data.questionCount}
      podium={podium}
      rows={rows}
      isGuest={result.data.guest}
      // 7일 보관 사실을 눈으로 확인시킨다 — 표가 없으면(만료·다른 기기) 약속하지 않는다
      // 별점을 못 남기는 이유(이미 냄·기간 지남 등)를 한 줄로 알린다
      ratingNotice={toRatingNotice(result.data.rating)}
      guestRecordNotice={
        result.data.guest && guestRecord !== null
          ? "7일 안에 가입하면 이 기록을 계정으로 옮길 수 있어요"
          : null
      }
      onOpenReport={() => router.push(`/result/${roomId}/report`)}
      onSignUp={() => router.push(`/login?next=${encodeURIComponent(`/result/${roomId}`)}`)}
    />
  );
}
