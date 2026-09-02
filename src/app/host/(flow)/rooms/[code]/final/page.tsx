"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import {
  toFinalRanking,
  toHardestQuestion,
  toReportAccuracy,
  toSessionSummary,
} from "@/features/host/live/adapt";
import { FinalPage } from "@/features/host/live/final-page";
import type { PodiumEntry } from "@/features/host/live/podium";
import { useHostRoomId, useRoom } from "@/lib/queries/use-rooms";
import { useRoomReport } from "@/lib/queries/use-results";
import { useSessionStore } from "@/lib/stores/session-store";

/**
 * W-12 최종 순위 컨테이너. 세션이 끝나면 진행·문항 결과 화면이 여기로 보낸다.
 * 순위·아바타는 세션 스토어의 finalRanking에서, 정답 수·문항별 정답률은 방 리포트에서 온다.
 */
export default function Page() {
  const params = useParams<{ code: string }>();
  const pin = params.code;
  const router = useRouter();

  const room = useHostRoomId(pin);
  const roomId = room.roomId;

  const phase = useSessionStore((s) => s.phase);
  const finalRanking = useSessionStore((s) => s.finalRanking);
  const ranking = useSessionStore((s) => s.ranking);
  const totalCount = useSessionStore((s) => s.totalCount);
  const snapshotTs = useSessionStore((s) => s.snapshotTs);

  const report = useRoomReport(roomId);
  // 끝난 방은 PIN으로 못 찾는다 — 제목은 roomId로 읽는다(캐시해 둔 id가 여기서 쓰인다)
  const detail = useRoom(roomId);

  // 아직 끝나지 않은 방을 주소로 열면 진행 흐름으로 돌려보낸다
  useEffect(() => {
    if (snapshotTs === null || phase === "FINISHED") return;
    router.replace(phase === "RUNNING" ? `/host/rooms/${pin}/live` : `/host/rooms/${pin}/lobby`);
  }, [phase, snapshotTs, pin, router]);

  if (room.isPending) return <ScreenLoading />;
  if (room.error) return <ScreenError message={room.error.message} />;

  // SESSION_ENDED가 finalRanking을 싣지 않으면 마지막 랭킹으로 대신한다
  const source = finalRanking.length > 0 ? finalRanking : ranking;
  const rows = toFinalRanking(source, report.data);
  const total = report.data?.summary?.questionCount ?? totalCount;

  const podium: [PodiumEntry, PodiumEntry, PodiumEntry] | null =
    rows.length >= 3
      ? [
          { student: rows[0].student, score: rows[0].score, correctCount: rows[0].correctCount },
          { student: rows[1].student, score: rows[1].score, correctCount: rows[1].correctCount },
          { student: rows[2].student, score: rows[2].score, correctCount: rows[2].correctCount },
        ]
      : null;

  return (
    <FinalPage
      title={detail.data?.title ?? ""}
      questionTotal={total}
      podium={podium}
      rest={podium ? rows.slice(3) : rows}
      summary={toSessionSummary(report.data, rows.length, total)}
      accuracyByQuestion={toReportAccuracy(report.data, total)}
      hardest={toHardestQuestion(report.data)}
      // TODO(API): 순위 내보내기는 계약이 없다 (DESIGN_GAPS D-8)
      onExport={() => {}}
      onOpenReport={() => roomId !== null && router.push(`/host/sessions/${roomId}/review`)}
    />
  );
}
