"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toAvatarKey } from "@/components/common/student-avatar";
import {
  toRatingDeadlineLabel,
  toRatingNotice,
  toRatingSubmitMessage,
  toReportRows,
} from "@/features/participant/result/adapt";
import { FinalResultPage } from "@/features/participant/result/final-result-page";
import type { PodiumEntry, PodiumPlace } from "@/features/participant/result/podium-card";
import type { RankRow } from "@/features/participant/result/ranking-table";
import { RatingSheet } from "@/features/participant/result/rating-sheet";
import { readMyParticipant } from "@/lib/my-participant";
import { useSessionConnection } from "@/lib/queries/use-session-connection";
import { useSubmitRating } from "@/lib/queries/use-ratings";
import { useMyResult } from "@/lib/queries/use-results";
import { readGuestRecord } from "@/lib/guest-token-storage";
import { useClaimGuestRecord } from "@/lib/queries/use-me";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useSessionStore } from "@/lib/stores/session-store";

const NO_SUBSCRIBE = () => () => {};
const readMyId = () => readMyParticipant()?.participantId ?? null;
const readMyIdOnServer = () => null;
const readGuestRecordOnServer = () => null;

/**
 * P-Web 최종 결과 컨테이너 (시안 788:8834).
 * 내 점수·문항별 판정은 결과 조회에서, 전체 순위는 세션 스냅샷의 랭킹에서,
 * 반 평균 비교·소요 시간은 학습 리포트에서 온다 — AI 채점이 끝나면 서버 이벤트가 결과를 무효화한다.
 */
export default function Page() {
  const params = useParams<{ sessionId: string }>();
  const roomId = Number(params.sessionId);
  const router = useRouter();

  const validRoomId = Number.isFinite(roomId) ? roomId : null;

  useSessionConnection(validRoomId, { isHost: false });

  const finalRanking = useSessionStore((s) => s.finalRanking);
  const ranking = useSessionStore((s) => s.ranking);
  const result = useMyResult(validRoomId);
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
  // `mutate`는 렌더마다 새로 만들어지지 않는다 — 효과 의존성에 넣어도 다시 돌지 않는다
  const claimMutate = claim.mutate;
  /**
   * 이관은 **효과에서** 한 번만 건다 — 렌더 중에 부르면 React가 금지하는 부수효과이고
   * StrictMode에서 두 번 실행돼 같은 이관이 중복 요청된다(QA_BACKLOG F-7).
   * 잠금은 state가 아니라 ref다 — StrictMode의 두 번째 실행은 첫 실행의 setState가
   * 반영되기 전에 오므로 state로는 못 막는다.
   */
  const claimed = useRef(false);
  useEffect(() => {
    if (claimed.current || !isMember || !guestRecord) return;
    claimed.current = true;
    claimMutate(
      { guestToken: guestRecord.guestToken, roomId: guestRecord.roomId },
      { onError: () => undefined },
    );
  }, [isMember, guestRecord, claimMutate]);

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
  const questionCount = result.data.questionCount ?? 0;

  // 참여 기록이 없으면(다른 탭·새로고침) 내 등수로 대신 찾는다
  const myRank = result.data.rank;
  const myParticipantId = myId ?? source.find((r) => r.rank === myRank)?.participantId ?? null;

  const podium: PodiumEntry[] = source
    .filter((entry) => entry.rank <= 3)
    .map((entry) => ({
      rank: entry.rank as PodiumPlace,
      student: {
        id: String(entry.participantId),
        name: entry.nickname,
        avatar: toAvatarKey(entry.avatarId),
      },
      score: entry.totalScore,
    }));

  const rankRows: RankRow[] = source.map((entry) => ({
    rank: entry.rank,
    participantId: entry.participantId,
    name: entry.nickname,
    score: entry.totalScore,
    // 맞힌 문항 수는 랭킹 계약에 없다 — 표가 그 칸을 "미제출"이 아니라 "—"로 그린다
    correctCount: null,
    isMe: myParticipantId !== null && entry.participantId === myParticipantId,
  }));

  // 부제는 서버가 준 조각만 이어 붙인다 — 없는 조각은 통째로 뺀다
  const subtitle = ["최종 결과", questionCount > 0 ? `${questionCount}문항` : null]
    .filter((part): part is string => part !== null)
    .join(" · ");

  return (
    <FinalResultPage
      roomTitle={result.data.roomTitle ?? ""}
      subtitle={subtitle}
      myRank={myRank}
      myScore={result.data.totalScore}
      myCorrectCount={result.data.correctCount}
      questionCount={questionCount}
      podium={podium}
      rankRows={rankRows}
      questionRows={toReportRows(result.data.questions)}
      isGuest={result.data.guest}
      // @draft 소요 시간·반 평균 비교는 학습 리포트 계약에 없다 — 그 칸을 감춘다
      elapsedSeconds={null}
      comparison={null}
      // 별점을 못 남기는 이유를 한 줄로 알린다
      ratingNotice={toRatingNotice(result.data.rating)}
      // 7일 보관 사실은 표가 있을 때만 약속한다(만료·다른 기기면 표가 없다)
      guestRecordNotice={
        result.data.guest && guestRecord !== null
          ? "7일 안에 가입하면 이 기록을 계정으로 옮길 수 있어요"
          : null
      }
      onOpenReport={() => router.push(`/result/${roomId}/report`)}
      onSignUp={() => router.push(`/login?next=${encodeURIComponent(`/result/${roomId}`)}`)}
      onOpenQuestion={(no) => router.push(`/result/${roomId}/report/${no}`)}
    />
  );
}
