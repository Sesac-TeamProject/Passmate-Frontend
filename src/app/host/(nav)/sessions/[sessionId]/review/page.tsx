"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import {
  toEssayAnswers,
  toQuestionInsights,
  toReportStudents,
  toReviewProgressLabel,
  toReviewSaveMessage,
  toSessionReport,
} from "@/features/host/review/adapt";
import { ExportFailedDialog } from "@/features/host/review/export-failed-dialog";
import { ReviewPage, type ExportFormat } from "@/features/host/review/review-page";
import { ReviewSkeleton } from "@/features/host/review/review-skeleton";
import { exportRoomReport } from "@/lib/api/results";
import { AppError } from "@/lib/types/app-error";
import { usePostHostReview, useReviewTargets, useSessionResults } from "@/lib/queries/use-results";

/** 목 모드는 파일을 만들지 못한다(`downloadFile`이 목 계층을 타지 않는다) */
const EXPORT_UNAVAILABLE_MESSAGE = "백엔드 연동 후 제공돼요";
/** 서버는 CSV만 내보낸다 — PDF는 400으로 막힌다 */
const PDF_UNSUPPORTED_MESSAGE = "지금은 CSV로만 내보낼 수 있어요";

/**
 * W-07 방 리포트 컨테이너. [sessionId]는 roomId다(사전 판정).
 * 우측 상세 패널이 볼 문항 id를 여기서 들고 있는다.
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

  // 학생별 탭 — 고른 학생의 답안을 불러와 답안 단위로 첨삭한다
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const participantId = selectedStudentId === null ? null : Number(selectedStudentId);
  const reviewTargets = useReviewTargets(
    participantId === null ? null : roomId,
    participantId === null ? {} : { participantId },
  );
  const saveReview = usePostHostReview(roomId, participantId ?? 0);

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // 실패한 형식을 기억한다 — 다시 시도가 엉뚱한 형식으로 가지 않게 한다
  const [failedFormat, setFailedFormat] = useState<ExportFormat>("CSV");

  const handleExport = async (format: ExportFormat) => {
    setExportError(null);
    setFailedFormat(format);
    setExporting(true);
    try {
      await exportRoomReport(roomId, format);
    } catch (error) {
      // 서버가 지원하지 않는 형식은 400으로 막는다 — 백엔드 연동 문제가 아니라 형식 문제다
      const unsupported = AppError.isAppError(error) && error.kind === "ValidationFailed";
      setExportError(unsupported ? PDF_UNSUPPORTED_MESSAGE : EXPORT_UNAVAILABLE_MESSAGE);
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
        selectedQuestionId={selectedQuestionId}
        onSelectQuestion={setSelectedQuestionId}
        insight={toQuestionInsights().get(selectedQuestionId ?? "") ?? null}
        // @draft 문항 단위 코멘트 저장 계약이 없다(답안 단위 첨삭만 있다) — 계약이 오면 뮤테이션을 붙이고 true로 연다
        canSaveComment={false}
        onSaveComment={() => undefined}
        students={toReportStudents(report.data.participants)}
        selectedStudentId={selectedStudentId}
        onSelectStudent={setSelectedStudentId}
        studentAnswers={reviewTargets.data ? toEssayAnswers(reviewTargets.data) : []}
        answersLoading={participantId !== null && reviewTargets.isPending}
        reviewProgressLabel={toReviewProgressLabel(reviewTargets.data)}
        onSaveReview={(answerId, draft) =>
          saveReview.mutate({
            answerId,
            body: {
              comment: draft.comment,
              improvement: draft.improvement,
              adjustedScore: draft.adjustedScore ?? undefined,
            },
          })
        }
        savingAnswerId={saveReview.isPending ? saveReview.variables.answerId : null}
        reviewError={saveReview.isError ? toReviewSaveMessage(saveReview.error) : null}
        onExport={handleExport}
        exporting={exporting}
      />
      <ExportFailedDialog
        open={exportError !== null}
        onOpenChange={(open) => !open && setExportError(null)}
        description={exportError ?? undefined}
        onRetry={() => handleExport(failedFormat)}
        retrying={exporting}
      />
    </>
  );
}
