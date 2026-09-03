"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { toQuestionInsights, toSessionReport } from "@/features/host/review/adapt";
import { ExportFailedDialog } from "@/features/host/review/export-failed-dialog";
import { ReviewPage, type ExportFormat } from "@/features/host/review/review-page";
import { ReviewSkeleton } from "@/features/host/review/review-skeleton";
import { exportRoomReport } from "@/lib/api/results";
import { useSessionResults } from "@/lib/queries/use-results";

/** 목 라우트가 없어 목 모드에서는 404가 난다 — 실제 실패도 같은 안내로 접는다 */
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

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async (format: ExportFormat) => {
    setExportError(null);
    setExporting(true);
    try {
      await exportRoomReport(roomId, format);
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
        selectedQuestionId={selectedQuestionId}
        onSelectQuestion={setSelectedQuestionId}
        insight={toQuestionInsights().get(selectedQuestionId ?? "") ?? null}
        // @draft 문항 단위 코멘트 저장 계약이 없다(답안 단위 첨삭만 있다) — 계약이 오면 뮤테이션을 붙이고 true로 연다
        canSaveComment={false}
        onSaveComment={() => undefined}
        onExport={handleExport}
        exporting={exporting}
      />
      <ExportFailedDialog
        open={exportError !== null}
        onOpenChange={(open) => !open && setExportError(null)}
        description={exportError ?? undefined}
        onRetry={() => handleExport("CSV")}
        retrying={exporting}
      />
    </>
  );
}
