"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PendingLabel } from "@/components/common/pending-label";
import type { FinalRankRow } from "@/features/host/live/rank-columns";
import type { EssayAnswer, QuestionInsight, SessionReport, Student } from "@/features/host/types";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { QuestionInsightPanel } from "./question-insight-panel";
import { StudentReviewPanel, type ReviewDraft } from "./student-review-panel";

import type { ExportFormat, ReviewTab } from "./review-page";

const REVIEW_TABS: readonly ReviewTab[] = ["개요", "문항별", "학생별"];

type Props = {
  tab: ReviewTab;
  onTabChange: (tab: ReviewTab) => void;
  report: SessionReport;
  rankRows: FinalRankRow[];
  onSelectQuestion: (id: string) => void;
  insight: QuestionInsight | null;
  canSaveComment: boolean;
  onSaveComment: (text: string) => void;
  commentSaving?: boolean;
  commentError?: string | null;
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

/**
 * M-14 방 리포트 (앱) — 시안 v6 `03 · 앱` 개요 719:8624 · 문항별 432:5366 · 학생별 719:8760. 렌더 전용.
 *
 * 웹 W-07과 같은 데이터·조작을 받되, 좌우 2단(목록 + 상세 424px)을 한 줄로 쌓는다.
 * 시안에는 목록만 있고 줄을 눌렀을 때의 상세 화면은 없다 — 첨삭은 선생님 핵심 기능이라 빼지 않고,
 * 줄을 누르면 웹과 같은 상세 패널을 그 아래에 전체 폭으로 연다.
 *
 * 시안과 다르게 간 곳:
 * - AI 총평 카드(개요)는 그리지 않는다. 리포트 계약에 총평 필드가 없어 채우면 지어낸 문장이 된다.
 * - 머리글 부제의 PIN을 뺐다. 리포트 응답에 PIN이 없다.
 * - 문항별 탭의 켜진 탭 색이 시안에서만 연민트(#d6f3e6)다. 개요·학생별과 같은 민트로 맞췄다.
 */
export function ReviewMobile({
  tab,
  onTabChange,
  report,
  rankRows,
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
}: Props) {
  const [exportOpen, setExportOpen] = useState(false);
  // 상세는 눌렀을 때만 연다 — 컨테이너가 첫 문항을 미리 골라 두어도 목록 아래가 늘 열려 있지 않게
  const [openQuestionId, setOpenQuestionId] = useState<string | null>(null);
  const [openStudentId, setOpenStudentId] = useState<string | null>(null);

  const meta = [report.dateLabel, "종료된 방"].filter((part) => part !== "").join(" · ");
  const stats = [
    { value: `${report.stats.accuracy}%`, label: "평균 정답률" },
    { value: `${report.stats.students}명`, label: "참가 학생" },
    { value: `${report.stats.questions}개`, label: "문항" },
    { value: `${report.stats.aiAnalyses}건`, label: "AI 분석" },
  ];

  const handleQuestion = (id: string) => {
    const next = openQuestionId === id ? null : id;
    setOpenQuestionId(next);
    if (next !== null) onSelectQuestion(next);
  };

  const handleStudent = (id: string) => {
    const next = openStudentId === id ? null : id;
    setOpenStudentId(next);
    if (next !== null) onSelectStudent(next);
  };

  const openQuestion = report.questions.find((q) => q.id === openQuestionId) ?? null;

  return (
    // 하단 탭바는 레이아웃(host/(nav))이 fixed로 그리고 본문 아래를 그 높이만큼 띄운다 — 최소 높이에서 빼야 헛스크롤이 없다
    <main className="flex min-h-[calc(100dvh-var(--mobile-tab-bar-h))] flex-col bg-card md:hidden">
      <header className="flex items-center gap-3 px-5 pt-14 pb-4">
        <Link href="/host/rooms" aria-label="내가 만든 방으로" className="text-ink">
          <ArrowLeft size={24} strokeWidth={2} aria-hidden />
        </Link>
        <h1 className="text-heading-md text-ink">방 리포트</h1>
        <div className="ml-auto flex items-center gap-2">
          {exportOpen &&
            (["CSV", "PDF"] as const).map((format) => (
              <button
                key={format}
                type="button"
                onClick={() => onExport(format)}
                disabled={exporting}
                className="h-8 rounded-lg border px-3 text-label-md text-ink transition-colors hover:bg-muted disabled:opacity-60"
              >
                {exporting ? <PendingLabel>…</PendingLabel> : format}
              </button>
            ))}
          <button
            type="button"
            onClick={() => setExportOpen((v) => !v)}
            aria-expanded={exportOpen}
            className="text-label-lg text-mint transition-colors hover:text-mint-dark"
          >
            {exportOpen ? "닫기" : "내보내기"}
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 px-5 py-2 pb-6">
        <div className="flex flex-col gap-1">
          <p className="text-heading-lg text-ink">{report.title}</p>
          {meta && <p className="text-body-md text-muted-foreground">{meta}</p>}
        </div>

        <dl className="grid grid-cols-2 gap-2.5">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-0.5 rounded-[14px] border px-3.5 py-3">
              <dd className="text-heading-md text-mint">{s.value}</dd>
              <dt className="order-last text-label-md text-muted-foreground">{s.label}</dt>
            </div>
          ))}
        </dl>

        <div role="tablist" className="flex gap-2">
          {REVIEW_TABS.map((name) => (
            <button
              key={name}
              role="tab"
              type="button"
              aria-selected={tab === name}
              onClick={() => onTabChange(name)}
              className={cn(
                "rounded-full px-3.5 py-2 text-label-lg transition-colors",
                tab === name ? "bg-mint text-white" : "bg-muted text-muted-foreground",
              )}
            >
              {name}
            </button>
          ))}
        </div>

        {tab === "개요" && (
          <Overview
            report={report}
            rankRows={rankRows}
            onOpenQuestions={() => onTabChange("문항별")}
          />
        )}

        {tab === "문항별" && (
          <>
            <ul className="overflow-hidden rounded-2xl border">
              {report.questions.map((q) => (
                <li key={q.id} className="border-b last:border-b-0">
                  <button
                    type="button"
                    onClick={() => handleQuestion(q.id)}
                    aria-expanded={openQuestionId === q.id}
                    className={cn(
                      "flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors",
                      openQuestionId === q.id ? "bg-mint-bg" : "hover:bg-muted",
                    )}
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-[14px] bg-muted text-label-md text-ink">
                      Q{q.index}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate text-label-lg text-ink">{q.title}</span>
                        {q.aiCount !== undefined && q.aiCount > 0 ? (
                          <span className="shrink-0 text-label-md text-mint">
                            AI 분석 {q.aiCount}건
                          </span>
                        ) : q.type === "essay" ? (
                          <span className="shrink-0 text-label-md text-mint">서술형</span>
                        ) : null}
                      </span>
                      {q.accuracy !== undefined && (
                        <span className="h-1.5 overflow-hidden rounded-[3px] bg-border">
                          <span
                            className="block h-full rounded-[3px] bg-mint"
                            style={{ width: `${q.accuracy}%` }}
                          />
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-label-md text-muted-foreground tabular-nums">
                      {q.accuracy === undefined ? "—" : `${q.accuracy}%`}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            {openQuestion !== null && (
              <QuestionInsightPanel
                key={openQuestion.id}
                question={openQuestion}
                insight={insight}
                canSaveComment={canSaveComment}
                onSaveComment={onSaveComment}
                commentSaving={commentSaving}
                commentError={commentError}
                stacked
              />
            )}
          </>
        )}

        {tab === "학생별" && (
          <StudentTab
            rankRows={rankRows}
            questionTotal={report.stats.questions}
            openStudentId={openStudentId}
            onOpen={handleStudent}
          >
            {openStudentId !== null && (
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
                stacked
              />
            )}
          </StudentTab>
        )}
      </div>
    </main>
  );
}

/** 정답률 구간 — 시안 막대 색 순서(분홍 · 노랑 · 연민트 · 민트) */
const BUCKETS = [
  { label: "0~40%", max: 40, fill: "bg-choice-a" },
  { label: "41~60%", max: 60, fill: "bg-choice-c" },
  { label: "61~80%", max: 80, fill: "bg-mint-tint" },
  { label: "81~100%", max: 100, fill: "bg-mint" },
] as const;

function Overview({
  report,
  rankRows,
  onOpenQuestions,
}: {
  report: SessionReport;
  rankRows: FinalRankRow[];
  onOpenQuestions: () => void;
}) {
  // 학생별 정답률은 서버가 주는 맞힌 수 ÷ 문항 수로만 구한다. 답을 안 낸 학생(correctCount null)은 뺀다.
  const total = report.stats.questions;
  const percents =
    total > 0
      ? rankRows
          .filter((r): r is FinalRankRow & { correctCount: number } => r.correctCount !== null)
          .map((r) => (r.correctCount / total) * 100)
      : [];
  const counts = BUCKETS.map(
    (b, i) => percents.filter((p) => p <= b.max && (i === 0 || p > BUCKETS[i - 1].max)).length,
  );
  const maxCount = Math.max(...counts, 0);

  // 오답률은 정답률이 있는 문항(객관식·OX)만 — 서술형은 정답률이 없어 줄을 세울 수 없다
  const worst = report.questions
    .filter((q) => q.accuracy !== undefined)
    .sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0))
    .slice(0, 3);

  return (
    <>
      {percents.length > 0 && (
        <section className="flex flex-col gap-3 rounded-2xl border px-4 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-label-lg font-bold text-ink">정답률 분포</h2>
            <span className="text-label-md text-ink-disabled">학생 {percents.length}명</span>
          </div>
          <ul className="flex flex-col gap-2.5">
            {BUCKETS.map((b, i) => (
              <li key={b.label} className="flex items-center gap-3">
                <span className="w-14 shrink-0 text-label-md text-muted-foreground">{b.label}</span>
                <span className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-[5px] bg-line-soft">
                  <span
                    className={cn("block h-full rounded-[5px]", b.fill)}
                    style={{ width: `${maxCount > 0 ? (counts[i] / maxCount) * 100 : 0}%` }}
                  />
                </span>
                <span className="w-8 shrink-0 text-right text-label-md font-bold text-ink tabular-nums">
                  {counts[i]}명
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {worst.length > 0 && (
        <section className="flex flex-col gap-3 rounded-2xl border px-4 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-label-lg font-bold text-ink">많이 틀린 문항 TOP {worst.length}</h2>
            <button
              type="button"
              onClick={onOpenQuestions}
              className="text-label-md font-bold text-mint-dark"
            >
              문항별 ›
            </button>
          </div>
          <ul className="flex flex-col gap-3">
            {worst.map((q) => (
              <li key={q.id} className="flex items-center gap-2">
                <span className="flex h-[22px] w-[30px] shrink-0 items-center justify-center rounded-md bg-muted text-label-md font-bold text-muted-foreground">
                  Q{q.index}
                </span>
                <span className="min-w-0 flex-1 truncate text-label-lg text-ink">{q.title}</span>
                <span className="shrink-0 text-label-md font-bold text-choice-a-foreground tabular-nums">
                  오답 {100 - (q.accuracy ?? 0)}%
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {percents.length === 0 && worst.length === 0 && (
        <p className="rounded-2xl border border-dashed px-4 py-12 text-center text-label-lg text-muted-foreground">
          채점이 끝나면 요약이 채워져요
        </p>
      )}
    </>
  );
}

function StudentTab({
  rankRows,
  questionTotal,
  openStudentId,
  onOpen,
  children,
}: {
  rankRows: FinalRankRow[];
  questionTotal: number;
  openStudentId: string | null;
  onOpen: (id: string) => void;
  children: React.ReactNode;
}) {
  const [sort, setSort] = useState<"score" | "name">("score");

  // 머리글 · 목록 · 미제출 카드가 같은 한 목록에서 나와야 숫자가 서로 맞는다
  const submitted = rankRows.filter((r) => r.correctCount !== null);
  const missed = rankRows.filter((r) => r.correctCount === null);
  const rows =
    sort === "score"
      ? [...submitted].sort((a, b) => a.rank - b.rank)
      : [...submitted].sort((a, b) => a.student.name.localeCompare(b.student.name, "ko"));

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-label-lg font-bold text-ink">
          학생 {rankRows.length}명 · 제출 {submitted.length}
        </p>
        <div className="flex gap-2">
          {(
            [
              ["score", "점수순"],
              ["name", "이름순"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={sort === key}
              onClick={() => setSort(key)}
              className={cn(
                "h-[30px] w-[66px] rounded-full text-label-md transition-colors",
                sort === key
                  ? "bg-muted font-bold text-muted-foreground"
                  : "border bg-card text-ink-disabled",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {rows.length > 0 && (
        <ul className="overflow-hidden rounded-2xl border">
          {rows.map((row) => {
            const top = row.rank <= 3;
            const open = openStudentId === row.student.id;

            return (
              <li key={row.student.id} className="border-b border-line-soft last:border-b-0">
                <button
                  type="button"
                  onClick={() => onOpen(row.student.id)}
                  aria-expanded={open}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                    open ? "bg-mint-bg" : "hover:bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-[26px] shrink-0 items-center justify-center rounded-full text-label-md font-bold",
                      top ? "bg-mint-bg text-mint-dark" : "bg-muted text-ink-disabled",
                    )}
                  >
                    {row.rank}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-label-lg font-bold text-ink">
                      {row.student.name}
                    </span>
                    <span className="text-label-md text-muted-foreground">
                      정답 {row.correctCount}/{questionTotal}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-label-lg font-bold tabular-nums",
                      top ? "text-mint" : "text-muted-foreground",
                    )}
                  >
                    {formatNumber(row.score)}점
                  </span>
                  <span aria-hidden className="shrink-0 text-label-lg text-ink-disabled">
                    ›
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {children}

      {missed.length > 0 && (
        <section className="flex flex-col gap-1 rounded-[14px] bg-negative-bg px-[18px] py-3.5 text-choice-a-foreground">
          <p className="text-label-lg font-bold">미제출 {missed.length}명</p>
          <p className="text-label-md">
            {missed.map((r) => r.student.name).join(" · ")} — 입장했지만 답안을 내지 않았어요
          </p>
        </section>
      )}
    </>
  );
}
