"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toReportRows } from "@/features/participant/result/adapt";
import { ReportDialog } from "@/features/participant/result/report-dialog";
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

  const questions = result.data.questions ?? [];
  const rows = toReportRows(questions);
  const concepts = report.data.concepts ?? [];
  const questionCount = result.data.questionCount ?? questions.length;

  // 부제는 서버가 준 조각만 이어 붙인다 — 없는 조각은 통째로 뺀다
  const subtitle = [
    report.data.dateLabel ?? null,
    report.data.attemptCount ? `${report.data.attemptCount}회차 참여` : null,
    questionCount > 0 ? `문항 ${questionCount}개` : null,
  ]
    .filter((part): part is string => part !== null)
    .join(" · ");

  const wrongCount = rows.filter((row) => row.verdict === "WRONG").length;
  const weakestConcept =
    concepts.length === 0
      ? null
      : [...concepts].sort(
          (a, b) =>
            a.correctCount / Math.max(1, a.questionCount) -
            b.correctCount / Math.max(1, b.questionCount),
        )[0].name;

  const handleShare = () => {
    void navigator.clipboard.writeText(window.location.href);
  };

  return (
    <>
      <ReportPage
        roomTitle={result.data.roomTitle ?? ""}
        subtitle={subtitle}
        correctCount={result.data.correctCount ?? 0}
        questionCount={questionCount}
        myRank={result.data.rank ?? null}
        participantCount={report.data.participantCount ?? null}
        accuracyPercent={report.data.accuracyPercent ?? 0}
        elapsedSeconds={report.data.elapsedSeconds ?? null}
        myScore={result.data.totalScore ?? 0}
        comparison={report.data.comparison ?? null}
        trend={report.data.trend ?? []}
        concepts={concepts}
        rows={rows}
        wrongCount={wrongCount}
        weakestConcept={weakestConcept}
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
        onSubmit={(reason, detail) =>
          sendReport.mutate(
            { targetType: "ROOM", targetId: roomId, reason, detail },
            { onSuccess: () => setReportOpen(false) },
          )
        }
        pending={sendReport.isPending}
        errorMessage={sendReport.isError ? sendReport.error.message : null}
      />
    </>
  );
}
