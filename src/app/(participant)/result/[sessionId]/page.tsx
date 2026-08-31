"use client";

import { useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toRankedStudents } from "@/features/host/live/adapt";
import {
  FinalResultPage,
  type PodiumEntry,
  type PodiumPlace,
  type RankRow,
} from "@/features/participant/result/final-result-page";
import { readMyParticipant } from "@/lib/my-participant";
import { useSessionConnection } from "@/lib/queries/use-session-connection";
import { useMyResult } from "@/lib/queries/use-results";
import { useSessionStore } from "@/lib/stores/session-store";

/** 순위 카드에 담는 행 수 — 시안은 3줄(1·2위 + 나) */
const ROW_LIMIT = 3;

const NO_SUBSCRIBE = () => () => {};
const readMyId = () => readMyParticipant()?.participantId ?? null;
const readMyIdOnServer = () => null;

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

  // sessionStorage는 서버 렌더에 없다 — 서버 스냅샷을 null로 둬 하이드레이션을 맞춘다
  const myId = useSyncExternalStore(NO_SUBSCRIBE, readMyId, readMyIdOnServer);

  if (result.isPending) return <ScreenLoading />;
  if (result.isError)
    return <ScreenError message={result.error.message} onRetry={() => result.refetch()} />;

  const source = finalRanking.length > 0 ? finalRanking : ranking;
  const students = toRankedStudents(source);

  const podium: PodiumEntry[] = source
    .filter((r) => r.rank <= 3)
    .map((r, i) => ({ rank: r.rank as PodiumPlace, student: students[i] }));

  // 참여 기록이 없으면(다른 탭·새로고침) 내 등수로 대신 찾는다
  const myRank = result.data.rank ?? null;
  const myParticipantId = myId ?? source.find((r) => r.rank === myRank)?.participantId ?? null;

  const rows: RankRow[] = source.slice(0, ROW_LIMIT).map((r, i) => ({
    rank: r.rank,
    student: students[i],
    score: r.total,
    isMe: myParticipantId !== null && r.participantId === myParticipantId,
  }));

  return (
    <FinalResultPage
      myRank={myRank}
      myScore={result.data.totalScore ?? 0}
      myCorrectCount={result.data.correctCount ?? 0}
      questionCount={result.data.questionCount ?? 0}
      podium={podium}
      rows={rows}
      isGuest={result.data.isGuest ?? false}
      // TODO(design): 리포트 화면(M-06)이 아직 없다 — 만들면 여기서 연결한다
      onOpenReport={undefined}
      onSignUp={() => router.push("/login")}
    />
  );
}
