"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toEssayAnswers, toReportStudents, toSessionReport } from "@/features/host/review/adapt";
import { ReviewPage } from "@/features/host/review/review-page";
import { downloadFile } from "@/lib/api/client";
import { useEssayAnswers, useRoomReport } from "@/lib/queries/use-results";

/** @draft — 계약 없음(../docs/tasks.md T060). 실패 시(목 모드 404 포함) 안내만 보여준다 */
const EXPORT_UNAVAILABLE_MESSAGE = "백엔드 연동 후 제공돼요";

/**
 * W-07 방 리포트 컨테이너. [sessionId]는 roomId다(사전 판정).
 * 우측 분석 패널이 볼 문항 id를 여기서 들고 있다가 서술형 답변(@draft) 조회를 구동한다.
 */
export default function Page() {
  const params = useParams<{ sessionId: string }>();
  const roomId = Number(params.sessionId);

  const report = useRoomReport(roomId);
  const questions = report.data ? toSessionReport(report.data, roomId).questions : [];

  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [syncedRoomId, setSyncedRoomId] = useState<number | null>(null);

  // 리포트가 로드되면 기본 선택 문항(서술형 우선)을 렌더 중 조정한다 — effect 안에서 setState하지 않는다.
  if (roomId !== syncedRoomId && questions.length > 0) {
    setSyncedRoomId(roomId);
    setSelectedQuestionId((questions.find((q) => q.type === "essay") ?? questions[0]).id);
  }

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId) ?? null;
  const essayQuestionId = selectedQuestion?.type === "essay" ? Number(selectedQuestion.id) : null;
  const essayAnswers = useEssayAnswers(roomId, essayQuestionId);

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    setExportError(null);
    setExporting(true);
    try {
      // @draft — 계약 없음(../docs/tasks.md T060)
      await downloadFile(`/sessions/${roomId}/stats/export`, `passmate-report-${roomId}.csv`);
    } catch {
      // 목 모드에서는 라우트가 없어 404(AppError)가 난다 — 실제 실패도 같은 안내로 접는다.
      setExportError(EXPORT_UNAVAILABLE_MESSAGE);
    } finally {
      setExporting(false);
    }
  };

  if (report.isPending) return <ScreenLoading />;
  if (report.isError)
    return <ScreenError message={report.error.message} onRetry={() => report.refetch()} />;

  return (
    <ReviewPage
      report={toSessionReport(report.data, roomId)}
      students={toReportStudents(report.data.students ?? [])}
      selectedQuestionId={selectedQuestionId}
      onSelectQuestion={setSelectedQuestionId}
      essayAnswers={essayAnswers.data ? toEssayAnswers(essayAnswers.data) : []}
      onExport={handleExport}
      exporting={exporting}
      exportError={exportError}
    />
  );
}
