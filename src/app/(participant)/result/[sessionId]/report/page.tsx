"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toReportRows } from "@/features/participant/result/adapt";
import { ReportDialog } from "@/features/participant/result/report-dialog";
import { reportTypeLabel } from "@/features/participant/result/report-reasons";
import { ReportPage } from "@/features/participant/result/report-page";
import { useSessionConnection } from "@/lib/queries/use-session-connection";
import { useReport } from "@/lib/queries/use-me";
import { useMyReport, useMyResult } from "@/lib/queries/use-results";

/**
 * P-Web 내 리포트 컨테이너 (시안 787:8834).
 * 점수·문항별 판정은 개인 결과에서, 분석 카드 3장은 학습 리포트에서 온다 —
 * 서술형 AI 분석은 세션이 끝난 뒤 도착하므로 세션에 붙어 갱신을 받는다.
 */
export default function Page() {
  const params = useParams<{ sessionId: string }>();
  const roomId = Number(params.sessionId);
  const router = useRouter();

  const validRoomId = Number.isFinite(roomId) ? roomId : null;

  useSessionConnection(validRoomId, { isHost: false });

  const result = useMyResult(validRoomId);
  const report = useMyReport(validRoomId);
  const sendReport = useReport();
  const [reportOpen, setReportOpen] = useState(false);

  if (result.isPending || report.isPending) return <ScreenLoading />;
  if (result.isError)
    return <ScreenError message={result.error.message} onRetry={() => result.refetch()} />;
  if (report.isError)
    return <ScreenError message={report.error.message} onRetry={() => report.refetch()} />;

  const questions = result.data.questions;
  const rows = toReportRows(questions);
  const questionCount = result.data.questionCount;

  // 부제는 서버가 준 조각만 이어 붙인다 — 없는 조각은 통째로 뺀다.
  // 계약에 회차·날짜 라벨이 없어(@draft) 지금 남는 조각은 문항 수뿐이다.
  const subtitle = questionCount > 0 ? `문항 ${questionCount}개` : "";

  const wrongCount = rows.filter((row) => row.verdict === "WRONG").length;
  // 계약에 개념별 정답률이 없다 — 리포트가 주는 취약 주제의 첫 항목으로 대신한다
  const weakestConcept = report.data.weakTopics[0] ?? null;

  const handleShare = () => {
    void navigator.clipboard.writeText(window.location.href);
  };

  return (
    <>
      <ReportPage
        roomTitle={result.data.roomTitle}
        subtitle={subtitle}
        correctCount={result.data.correctCount}
        questionCount={questionCount}
        myRank={result.data.rank}
        // 서버는 소수로 준다(16.666…) — 시안은 정수 한 자리("71%")다
        accuracyPercent={Math.round(report.data.accuracy)}
        myScore={result.data.totalScore}
        rows={rows}
        wrongCount={wrongCount}
        weakestConcept={weakestConcept}
        // @draft 계약에 없는 값들 — 참가자 수·소요 시간·비교/추이/개념 카드.
        // 지어내지 않고 비워 두면 ReportPage가 해당 자리를 감춘다
        participantCount={null}
        elapsedSeconds={null}
        comparison={null}
        trend={[]}
        concepts={[]}
        onBack={() => router.push("/me/joined")}
        // 내보내기 계약이 없어 브라우저 인쇄로 대신한다 — PDF 저장은 인쇄 대화상자에서 고른다
        onSavePdf={() => window.print()}
        // @draft 오답 재풀이·복습 방 추천 계약이 없다 — 지금은 공개 방 목록으로 보낸다
        onRetryWrong={() => router.push("/rooms")}
        onFindReviewRoom={() => router.push("/rooms")}
        onShare={handleShare}
        onOpenQuestion={(no) => router.push(`/result/${roomId}/report/${no}`)}
        onReport={validRoomId === null ? undefined : () => setReportOpen(true)}
      />
      <ReportDialog
        open={reportOpen}
        onOpenChange={(open) => {
          setReportOpen(open);
          if (!open) sendReport.reset();
        }}
        onSubmit={(type, detail) =>
          sendReport.mutate(
            {
              targetType: "ROOM",
              targetId: roomId,
              type,
              // 서버의 `reason`은 자유 서술이다 — 안 적었으면 고른 항목 문구를 그대로 보낸다
              reason: detail?.trim() || reportTypeLabel(type),
            },
            { onSuccess: () => setReportOpen(false) },
          )
        }
        pending={sendReport.isPending}
        errorMessage={sendReport.isError ? sendReport.error.message : null}
      />
    </>
  );
}
