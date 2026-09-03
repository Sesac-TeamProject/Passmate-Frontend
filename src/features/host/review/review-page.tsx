"use client";

import { useState } from "react";
import type { EssayAnswer, QuestionInsight, SessionReport, Student } from "@/features/host/types";
import { PendingLabel } from "@/components/common/pending-label";
import { cn } from "@/lib/utils";
import { StudentReviewPanel, type ReviewDraft } from "./student-review-panel";
import { ReportBody } from "./report-body";
import { ReportStats } from "./report-stats";

const TABS = ["개요", "문항별", "학생별"] as const;
type Tab = (typeof TABS)[number];

export type ExportFormat = "CSV" | "PDF";

type Props = {
  report: SessionReport;
  selectedQuestionId: string | null;
  onSelectQuestion: (id: string) => void;
  insight: QuestionInsight | null;
  canSaveComment: boolean;
  onSaveComment: (text: string) => void;
  /** 학생별 탭 — 답안 단위 첨삭 */
  students: Student[];
  selectedStudentId: string | null;
  onSelectStudent: (studentId: string) => void;
  studentAnswers: EssayAnswer[];
  answersLoading: boolean;
  reviewProgressLabel: string | null;
  onSaveReview: (answerId: number, draft: ReviewDraft) => void;
  savingAnswerId: number | null;
  reviewError: string | null;
  onExport: (format: ExportFormat) => void;
  exporting?: boolean;
};

/** W-07 방 리포트 — 내가 만든 방 › 종료 카드 › "상세 보기" (시안 784:8825). 렌더 전용 */
export function ReviewPage({
  report,
  selectedQuestionId,
  onSelectQuestion,
  insight,
  canSaveComment,
  onSaveComment,
  students,
  selectedStudentId,
  onSelectStudent,
  studentAnswers,
  answersLoading,
  reviewProgressLabel,
  onSaveReview,
  savingAnswerId,
  reviewError,
  onExport,
  exporting,
}: Props) {
  const [tab, setTab] = useState<Tab>("문항별");

  const meta = [
    report.dateLabel,
    `학생 ${report.stats.students}명`,
    `문항 ${report.stats.questions}개`,
    "종료됨",
  ]
    .filter((part) => part !== "")
    .join(" · ");
  // 최저 문항은 저장하지 않고 문항 목록에서 그때그때 고른다 (규칙 문서 §6 파생 값)
  const lowest = [...report.questions]
    .filter((question) => question.accuracy !== undefined)
    .sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0))[0];

  return (
    <main className="flex min-h-screen flex-col gap-3 px-8 pt-6 pb-7">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-heading-lg text-ink">{report.title}</h1>
        <p className="text-label-md text-muted-foreground">{meta}</p>
      </div>

      <div className="flex items-center justify-between">
        <div role="tablist" className="flex gap-2">
          {TABS.map((name) => (
            <button
              key={name}
              role="tab"
              type="button"
              aria-selected={tab === name}
              onClick={() => setTab(name)}
              className={cn(
                "h-[34px] rounded-lg px-4 text-label-lg transition-colors",
                tab === name ? "bg-ink text-white" : "text-muted-foreground hover:bg-muted",
              )}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {(["CSV", "PDF"] as const).map((format) => (
            <button
              key={format}
              type="button"
              onClick={() => onExport(format)}
              disabled={exporting}
              className="h-[34px] w-16 rounded-lg border bg-card text-label-md text-ink transition-colors hover:bg-muted disabled:opacity-60"
            >
              {exporting ? <PendingLabel>…</PendingLabel> : format}
            </button>
          ))}
        </div>
      </div>

      <ReportStats
        stats={report.stats}
        lowest={
          lowest === undefined
            ? null
            : { label: `Q${lowest.index}`, accuracyPercent: lowest.accuracy ?? 0 }
        }
      />

      {tab === "문항별" ? (
        <ReportBody
          report={report}
          selectedQuestionId={selectedQuestionId}
          onSelectQuestion={onSelectQuestion}
          insight={insight}
          canSaveComment={canSaveComment}
          onSaveComment={onSaveComment}
        />
      ) : tab === "학생별" ? (
        <StudentReviewPanel
          students={students}
          selectedStudentId={selectedStudentId}
          onSelectStudent={onSelectStudent}
          answers={studentAnswers}
          loading={answersLoading}
          progressLabel={reviewProgressLabel}
          onSave={onSaveReview}
          savingAnswerId={savingAnswerId}
          saveError={reviewError}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed text-body-md text-muted-foreground">
          {tab} 탭은 계약이 오면 채운다
        </div>
      )}
    </main>
  );
}
