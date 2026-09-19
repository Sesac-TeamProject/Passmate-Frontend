"use client";

import { useState } from "react";
import type { EssayAnswer, QuestionInsight, SessionReport, Student } from "@/features/host/types";
import { PendingLabel } from "@/components/common/pending-label";
import { cn } from "@/lib/utils";
import type { FinalRankRow } from "@/features/host/live/rank-columns";
import { StudentReviewPanel, type ReviewDraft } from "./student-review-panel";
import { ReportBody } from "./report-body";
import { ReportOverview } from "./report-overview";
import { ReportPrintDoc } from "./report-print-doc";
import { ReportStats } from "./report-stats";
import { ReviewMobile } from "./review-mobile";

const TABS = ["개요", "문항별", "학생별"] as const;
export type ReviewTab = (typeof TABS)[number];
type Tab = ReviewTab;

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
  commentSaving?: boolean;
  commentError?: string | null;
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
  /**
   * 폭과 상관없이 PC 화면만 그린다 — 랜딩 목업용. 목업은 1440 캔버스를 `zoom`으로 줄여 담는데
   * 반응형 기준은 실제 화면 폭이라, 폰에서 랜딩을 열면 목업 안에 폰 화면(M-14)이 끼어든다.
   */
  desktopOnly?: boolean;
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
  commentSaving,
  commentError,
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
  desktopOnly = false,
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
    <>
      {/* 폰 폭 — 앱 M-14. 탭 상태는 PC 와 함께 쓴다. PDF 인쇄는 용지 폭이 기준이라 PC 틀로 찍힌다 */}
      {!desktopOnly && (
        <ReviewMobile
          tab={tab}
          onTabChange={setTab}
          report={report}
          rankRows={rankRows}
          onSelectQuestion={onSelectQuestion}
          insight={insight}
          canSaveComment={canSaveComment}
          onSaveComment={onSaveComment}
          commentSaving={commentSaving}
          commentError={commentError}
          students={students}
          selectedStudentId={selectedStudentId}
          onSelectStudent={onSelectStudent}
          studentAnswers={studentAnswers}
          answersLoading={answersLoading}
          reviewProgressLabel={reviewProgressLabel}
          onSaveReview={onSaveReview}
          savingAnswerId={savingAnswerId}
          reviewError={reviewError}
          onExport={onExport}
          exporting={exporting}
        />
      )}
      <main className={cn("min-h-screen px-8 pt-6 pb-7", !desktopOnly && "max-md:hidden")}>
        {/* 시안은 1440에서 본문 1136 — 폭을 묶고 남는 공간은 좌우로 나눈다 */}
        <div className="mx-auto flex max-w-[1136px] flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-heading-lg text-ink">{report.title}</h1>
            <p className="text-label-md text-muted-foreground">{meta}</p>
          </div>

          <ReportStats
            stats={report.stats}
            lowest={
              lowest === undefined
                ? null
                : { label: `Q${lowest.index}`, accuracyPercent: lowest.accuracy ?? 0 }
            }
          />

          {/* 탭·내보내기 버튼은 조작 도구다 — 인쇄물(PDF)에는 내용만 남긴다 */}
          <div className="flex items-center justify-between border-b print:hidden">
            {/* 밑줄 탭 — 채운 버튼은 이 화면에서 가장 진한 덩어리가 돼 요약보다 먼저 읽힌다 */}
            <div role="tablist" className="flex gap-1">
              {TABS.map((name) => (
                <button
                  key={name}
                  role="tab"
                  type="button"
                  aria-selected={tab === name}
                  onClick={() => setTab(name)}
                  className={cn(
                    "relative h-9 px-3 text-label-lg transition-colors",
                    tab === name ? "text-ink" : "text-muted-foreground hover:text-ink",
                  )}
                >
                  {name}
                  {tab === name && (
                    <span aria-hidden className="absolute inset-x-0 -bottom-px h-0.5 bg-mint" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pb-2">
              {(["CSV", "PDF"] as const).map((format) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => onExport(format)}
                  disabled={exporting}
                  className="h-8 w-16 rounded-md border bg-card text-label-md text-muted-foreground transition-colors hover:bg-muted hover:text-ink disabled:opacity-60"
                >
                  {exporting ? <PendingLabel>…</PendingLabel> : format}
                </button>
              ))}
            </div>
          </div>

          {/* 화면은 탭이라 한 번에 하나만 보인다 — 인쇄에서는 이 조작 뷰를 감추고 아래 문서를 쓴다 */}
          <div className="flex flex-1 flex-col print:hidden">
            {tab === "문항별" ? (
              <ReportBody
                report={report}
                selectedQuestionId={selectedQuestionId}
                onSelectQuestion={onSelectQuestion}
                insight={insight}
                canSaveComment={canSaveComment}
                onSaveComment={onSaveComment}
                commentSaving={commentSaving}
                commentError={commentError}
              />
            ) : tab === "학생별" ? (
              <StudentReviewPanel
                students={students}
                rows={rankRows}
                questionTotal={report.stats.questions}
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

          {/* PDF 저장 전용 — 지금 보던 탭과 무관하게 개요 + 문항별을 한 장에 담는다 */}
          <ReportPrintDoc report={report} rankRows={rankRows} />
        </div>
      </main>
    </>
  );
}
