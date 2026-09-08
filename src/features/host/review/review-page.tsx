"use client";

import { useState } from "react";
import type { EssayAnswer, QuestionInsight, SessionReport, Student } from "@/features/host/types";
import { PendingLabel } from "@/components/common/pending-label";
import { cn } from "@/lib/utils";
import type { FinalRankRow } from "@/features/host/live/rank-columns";
import { StudentReviewPanel, type ReviewDraft } from "./student-review-panel";
import { ReportBody } from "./report-body";
import { ReportOverview } from "./report-overview";
import { ReportStats } from "./report-stats";

const TABS = ["개요", "문항별", "학생별"] as const;
type Tab = (typeof TABS)[number];

export type ExportFormat = "CSV" | "PDF";

type Props = {
  report: SessionReport;
  /** 개요 탭 — 세션 종료 화면과 같은 최종 순위 (1위부터) */
  rankRows: FinalRankRow[];
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
  /** 처음 열 탭. 랜딩 목업이 "문항별" 스냅숏을 보여줄 때만 지정한다 */
  defaultTab?: Tab;
};

/** W-07 방 리포트 — 내가 만든 방 › 종료 카드 › "상세 보기" (시안 784:8825). 렌더 전용 */
export function ReviewPage({
  report,
  rankRows,
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
  defaultTab = "개요",
}: Props) {
  // 개요가 첫 탭이다 — 계약이 없어 비어 있던 동안만 문항별로 열어 두었다
  const [tab, setTab] = useState<Tab>(defaultTab);

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
    <main className="min-h-screen px-8 pt-6 pb-7">
      {/* 시안은 1440에서 본문 1136 — 폭을 묶고 남는 공간은 좌우로 나눈다 */}
      <div className="mx-auto flex max-w-[1136px] flex-col gap-3">
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
          <ReportOverview
            title={report.title}
            questionTotal={report.stats.questions}
            rows={rankRows}
          />
        )}
      </div>
    </main>
  );
}
