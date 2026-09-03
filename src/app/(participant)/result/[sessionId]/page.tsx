"use client";

import { useState, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toAvatarKey } from "@/components/common/student-avatar";
import { toReportRows } from "@/features/participant/result/adapt";
import { FinalResultPage } from "@/features/participant/result/final-result-page";
import type { PodiumEntry, PodiumPlace } from "@/features/participant/result/podium-card";
import type { RankRow } from "@/features/participant/result/ranking-table";
import { RatingSheet } from "@/features/participant/result/rating-sheet";
import { readMyParticipant } from "@/lib/my-participant";
import { useSessionConnection } from "@/lib/queries/use-session-connection";
import { useSubmitRating } from "@/lib/queries/use-ratings";
import { useMyReport, useMyResult } from "@/lib/queries/use-results";
import { useSessionStore } from "@/lib/stores/session-store";

const NO_SUBSCRIBE = () => () => {};
const readMyId = () => readMyParticipant()?.participantId ?? null;
const readMyIdOnServer = () => null;

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
  const report = useMyReport(validRoomId);
  const rate = useSubmitRating(roomId);
  const [rateSkipped, setRateSkipped] = useState(false);

  // sessionStorage는 서버 렌더에 없다 — 서버 스냅샷을 null로 둬 하이드레이션을 맞춘다
  const myId = useSyncExternalStore(NO_SUBSCRIBE, readMyId, readMyIdOnServer);

  if (result.isPending) return <ScreenLoading />;
  if (result.isError)
    return <ScreenError message={result.error.message} onRetry={() => result.refetch()} />;

  // P-Web 별점 시트 — 시안에 [건너뛰기]가 있다는 건 부르지 않아도 스스로 뜬다는 뜻이다.
  // 계약의 canRate가 문을 지킨다(이미 냈거나 24시간이 지나면 false).
  if (result.data.canRate && !rateSkipped)
    return (
      <RatingSheet
        // TODO(계약): 결과 응답에 호스트 이름이 없다 (DESIGN_GAPS G-8)
        hostName={null}
        subtitle={[result.data.roomTitle, `${result.data.questionCount ?? 0}문항`]
          .filter(Boolean)
          .join(" · ")}
        onSubmit={(body) => rate.mutate(body, { onSuccess: () => setRateSkipped(true) })}
        onSkip={() => setRateSkipped(true)}
        pending={rate.isPending}
        errorMessage={rate.isError ? rate.error.message : null}
      />
    );

  const source = finalRanking.length > 0 ? finalRanking : ranking;
  const questionCount = result.data.questionCount ?? 0;

  // 참여 기록이 없으면(다른 탭·새로고침) 내 등수로 대신 찾는다
  const myRank = result.data.rank ?? null;
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
      score: entry.total,
    }));

  const rankRows: RankRow[] = source.map((entry) => ({
    rank: entry.rank,
    participantId: entry.participantId,
    name: entry.nickname,
    score: entry.total,
    correctCount: entry.correctCount ?? null,
    isMe: myParticipantId !== null && entry.participantId === myParticipantId,
  }));

  // 부제는 서버가 준 조각만 이어 붙인다 — 없는 조각은 통째로 뺀다
  const subtitle = [
    "최종 결과",
    questionCount > 0 ? `${questionCount}문항` : null,
    report.data?.participantCount ? `${report.data.participantCount}명 참여` : null,
  ]
    .filter((part): part is string => part !== null)
    .join(" · ");

  return (
    <FinalResultPage
      roomTitle={result.data.roomTitle ?? ""}
      subtitle={subtitle}
      myRank={myRank}
      myScore={result.data.totalScore ?? 0}
      myCorrectCount={result.data.correctCount ?? 0}
      questionCount={questionCount}
      elapsedSeconds={report.data?.elapsedSeconds ?? null}
      comparison={report.data?.comparison ?? null}
      podium={podium}
      rankRows={rankRows}
      questionRows={toReportRows(result.data.questions ?? [])}
      isGuest={result.data.isGuest ?? false}
      onOpenReport={() => router.push(`/result/${roomId}/report`)}
      onSignUp={() => router.push("/login")}
      onOpenQuestion={(no) => router.push(`/result/${roomId}/report/${no}`)}
    />
  );
}
