"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import {
  toEssayAnswers,
  toReportStudents,
  toReviewProgressLabel,
  toReviewSaveMessage,
  toSessionReport,
} from "@/features/host/review/adapt";
import { ExportFailedDialog } from "@/features/host/review/export-failed-dialog";
import { ReviewPage } from "@/features/host/review/review-page";
import { ReviewSkeleton } from "@/features/host/review/review-skeleton";
import { exportRoomReport } from "@/lib/api/results";
import { usePostHostReview, useReviewTargets, useSessionResults } from "@/lib/queries/use-results";

/** 목 라우트가 없어 목 모드에서는 404가 난다 — 실제 실패도 같은 안내로 접는다 */
const EXPORT_UNAVAILABLE_MESSAGE = "백엔드 연동 후 제공돼요";

/**
 * W-07 방 리포트 컨테이너. [sessionId]는 roomId다(사전 판정).
 * 우측 분석 패널이 볼 문항 id를 여기서 들고 있다가 서술형 답변 조회를 구동한다.
 */
export default function Page() {
  const params = useParams<{ sessionId: string }>();
  const roomId = Number(params.sessionId);

  const report = useSessionResults(roomId);
  const questions = report.data ? toSessionReport(report.data).questions : [];

  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [syncedRoomId, setSyncedRoomId] = useState<number | null>(null);

  // 리포트가 로드되면 기본 선택 문항(서술형 우선)을 렌더 중 조정한다 — effect 안에서 setState하지 않는다.
  if (roomId !== syncedRoomId && questions.length > 0) {
    setSyncedRoomId(roomId);
    setSelectedQuestionId((questions.find((q) => q.type === "essay") ?? questions[0]).id);
  }

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId) ?? null;
  const essayQuestionId = selectedQuestion?.type === "essay" ? Number(selectedQuestion.id) : null;
  const essayAnswers = useReviewTargets(
    essayQuestionId === null ? null : roomId,
    essayQuestionId === null ? {} : { questionId: essayQuestionId },
  );

  /**
   * 첨삭 저장 — **서버에 저장 API가 아직 없다**(실서버 404). 목에서는 성공하고,
   * 실서버에서는 NotFound를 "준비 중"으로 접어 알린다.
   */
  const saveReview = usePostHostReview(roomId, essayQuestionId ?? 0);

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    setExportError(null);
    setExporting(true);
    try {
      await exportRoomReport(roomId);
    } catch {
      // 목 모드에서는 라우트가 없어 404(AppError)가 난다 — 실제 실패도 같은 안내로 접는다.
      setExportError(EXPORT_UNAVAILABLE_MESSAGE);
    } finally {
      setExporting(false);
    }
  };

  if (report.isPending) return <ReviewSkeleton />;
  if (report.isError)
    return <ScreenError message={report.error.message} onRetry={() => report.refetch()} />;

  return (
    <>
      <ReviewPage
        report={toSessionReport(report.data)}
        students={toReportStudents(report.data.participants)}
        progressLabel={toReviewProgressLabel(essayAnswers.data)}
        selectedQuestionId={selectedQuestionId}
        onSelectQuestion={setSelectedQuestionId}
        essayAnswers={essayAnswers.data ? toEssayAnswers(essayAnswers.data) : []}
        onSaveComment={(answerId, comment) => saveReview.mutate({ answerId, body: { comment } })}
        savingAnswerId={saveReview.isPending ? saveReview.variables.answerId : null}
        saveError={saveReview.isError ? toReviewSaveMessage(saveReview.error) : null}
        onExport={handleExport}
        exporting={exporting}
      />
      <ExportFailedDialog
        open={exportError !== null}
        onOpenChange={(open) => !open && setExportError(null)}
        description={exportError ?? undefined}
        onRetry={handleExport}
        retrying={exporting}
      />
    </>
  );
}
