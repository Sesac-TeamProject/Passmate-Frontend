"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toReportFeedback, toReportQuestions } from "@/features/participant/result/adapt";
import { ReportDialog } from "@/features/participant/result/report-dialog";
import { ReportPage } from "@/features/participant/result/report-page";
import { useSessionConnection } from "@/lib/queries/use-session-connection";
import { useReport } from "@/lib/queries/use-me";
import { useMyReport, useMyResult } from "@/lib/queries/use-results";

/**
 * M-06 학생 리포트 컨테이너.
 * 점수·문항별 판정은 개인 결과에서, 보완할 주제는 학습 리포트에서 온다 —
 * 서술형 AI 분석은 세션이 끝난 뒤 도착하므로 M-05와 같이 세션에 붙어 갱신을 받는다.
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

  return (
    <>
      <ReportPage
        roomTitle={result.data.roomTitle ?? ""}
        myRank={result.data.rank ?? null}
        myScore={result.data.totalScore ?? 0}
        correctCount={result.data.correctCount ?? 0}
        questionCount={result.data.questionCount ?? 0}
        weakTopics={report.data.weakTopics ?? []}
        questions={toReportQuestions(questions)}
        feedback={toReportFeedback(questions)}
        onBack={() => router.push(`/result/${roomId}`)}
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
