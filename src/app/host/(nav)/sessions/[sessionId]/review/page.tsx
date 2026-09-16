"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import {
  toCommentSaveMessage,
  toEssayAnswers,
  toQuestionInsights,
  toReportStudents,
  toReviewProgressLabel,
  toRankRows,
  toReviewSaveMessage,
  toSessionReport,
} from "@/features/host/review/adapt";
import { ExportFailedDialog } from "@/features/host/review/export-failed-dialog";
import { ReviewPage, type ExportFormat } from "@/features/host/review/review-page";
import { ReviewSkeleton } from "@/features/host/review/review-skeleton";
import { exportRoomReport } from "@/lib/api/results";
import {
  usePostHostReview,
  usePutQuestionComment,
  useReviewTargets,
  useSessionResults,
} from "@/lib/queries/use-results";

/** 목 모드는 파일을 만들지 못한다(`downloadFile`이 목 계층을 타지 않는다) */
const EXPORT_UNAVAILABLE_MESSAGE = "백엔드 연동 후 제공돼요";

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
  // 문항 단위 코멘트 — 학생 전체에게 남기는 첨삭. 답안별 첨삭(saveReview)과 별개다
  const saveComment = usePutQuestionComment(roomId);

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // 실패한 형식을 기억한다 — 다시 시도가 엉뚱한 형식으로 가지 않게 한다
  const [failedFormat, setFailedFormat] = useState<ExportFormat>("CSV");

  const handleExport = async (format: ExportFormat) => {
    // PDF 는 서버가 만들지 않는다 — 학생 리포트와 같은 방식으로 브라우저 인쇄를 연다.
    // 인쇄 대화상자에서 "PDF로 저장"을 고르면 화면 그대로(사이드바·버튼 제외) 담긴다
    if (format === "PDF") {
      window.print();
      return;
    }

    setExportError(null);
    setFailedFormat(format);
    setExporting(true);
    try {
      await exportRoomReport(roomId, format);
    } catch {
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
        rankRows={toRankRows(report.data.participants)}
        selectedQuestionId={selectedQuestionId}
        onSelectQuestion={setSelectedQuestionId}
        insight={toQuestionInsights(report.data).get(selectedQuestionId ?? "") ?? null}
        canSaveComment={selectedQuestionId !== null}
        onSaveComment={(text) => {
          if (selectedQuestionId === null) return;
          saveComment.mutate({ questionId: Number(selectedQuestionId), comment: text });
        }}
        commentSaving={saveComment.isPending}
        commentError={saveComment.isError ? toCommentSaveMessage(saveComment.error) : null}
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
