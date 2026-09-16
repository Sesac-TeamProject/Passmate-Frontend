"use client";

import { useState } from "react";
import type { GradingTone, QuestionInsight, ReportQuestion } from "@/features/host/types";
import { QUESTION_TYPE_LABEL } from "@/features/host/editor/question-type-chip";
import { PendingLabel } from "@/components/common/pending-label";
import { cn } from "@/lib/utils";

type Props = {
  question: ReportQuestion;
  /** 서버가 아직 못 준 상태(로딩·구버전)면 null — 채점 현황·분석 칸이 접힌다 */
  insight: QuestionInsight | null;
  canSaveComment: boolean;
  onSaveComment: (text: string) => void;
  commentSaving?: boolean;
  commentError?: string | null;
};

/** 채점 현황 막대 색 — 시안은 위에서부터 민트 · 앰버 · 핑크, 미제출은 회색 */
const TONE_FILL: Record<GradingTone, string> = {
  good: "bg-mint",
  partial: "bg-choice-c",
  bad: "bg-choice-a",
  none: "bg-ink-disabled",
};

/**
 * W-07 우측 문항 상세 — 채점 현황 · AI 분석/해설 · 선생님 코멘트 (시안 784:8983).
 *
 * 서술형과 객관식·OX 는 둘째 칸이 다르다. 서술형은 자동 채점이 없으니 **AI 판단 기준**
 * (모범답안 + 분석 집계)을, 객관식·OX 는 이미 세트에 적어 둔 **해설**을 그대로 보인다.
 */
export function QuestionInsightPanel({
  question,
  insight,
  canSaveComment,
  onSaveComment,
  commentSaving = false,
  commentError = null,
}: Props) {
  const [comment, setComment] = useState(insight?.hostComment ?? "");

  const graded = insight?.gradingBreakdown.reduce((sum, row) => sum + row.count, 0) ?? 0;
  const headerStat =
    question.type === "essay"
      ? insight === null
        ? "채점 중"
        : `채점 ${graded}/${graded + insight.unreviewedCount}`
      : question.accuracy === undefined
        ? "채점 중"
        : `정답률 ${question.accuracy}%`;
  const peak = Math.max(...(insight?.gradingBreakdown ?? []).map((row) => row.count), 1);

  return (
    <section className="flex w-full shrink-0 flex-col overflow-hidden rounded-lg border bg-card md:w-[424px]">
      <h2 className="flex h-[46px] items-center bg-ink px-[17px] text-label-lg text-white">
        Q{question.index} · {QUESTION_TYPE_LABEL[question.type]} · {headerStat}
      </h2>

      <div className="flex flex-1 flex-col gap-4 px-[17px] py-4">
        <p className="text-label-lg leading-relaxed text-ink">
          {question.prompt ?? question.title}
        </p>

        {insight !== null && (
          <section className="flex flex-col gap-2.5 border-t border-line-soft pt-3.5">
            <h3 className="text-label-md text-muted-foreground">채점 현황</h3>
            {insight.gradingBreakdown.map((row) => (
              <p key={row.label} className="flex items-center gap-2.5">
                <span className="w-[90px] shrink-0 text-label-md text-ink">{row.label}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-line-soft">
                  <span
                    className={cn("block h-full rounded-full", TONE_FILL[row.tone])}
                    style={{ width: `${(row.count / peak) * 100}%` }}
                  />
                </span>
                <span className="w-13 shrink-0 text-right text-label-md text-ink">
                  {row.count}명
                </span>
              </p>
            ))}
            {/* 첨삭 전 답안은 오답이 아니다 — 막대에 섞지 않고 따로 알린다 */}
            {insight.unreviewedCount > 0 && (
              <p className="text-label-md text-muted-foreground">
                아직 첨삭하지 않은 답안 {insight.unreviewedCount}건 — 학생별 탭에서 채점해 주세요
              </p>
            )}
          </section>
        )}

        {insight?.criteria && (
          <section className="flex flex-col gap-3 border-t border-line-soft pt-3.5">
            <h3 className="text-label-md text-mint-dark">AI 분석 (참고 의견)</h3>
            <InsightRow label="채점 기준">
              {insight.criteria.modelAnswer ?? "모범답안을 적지 않은 문항이에요"}
            </InsightRow>
            {insight.criteria.analyzedCount === 0 ? (
              <p className="text-label-md text-muted-foreground">
                학생이 AI 분석을 요청하면 잘 짚은 점·공통 누락이 여기에 모여요
              </p>
            ) : (
              <>
                <InsightList label="잘 짚은 점" items={insight.criteria.strengths} />
                <InsightList label="공통 누락" items={insight.criteria.misses} />
                <p className="text-label-md text-ink-disabled">
                  분석된 답안 {insight.criteria.analyzedCount}건 기준
                </p>
              </>
            )}
          </section>
        )}

        {insight?.explanation && (
          <section className="flex flex-col gap-3 border-t border-line-soft pt-3.5">
            <h3 className="text-label-md text-mint-dark">해설</h3>
            {insight.explanation.answer !== null && (
              <InsightRow label="정답">{insight.explanation.answer}</InsightRow>
            )}
            <p className="text-label-md leading-relaxed text-muted-foreground">
              {insight.explanation.text ?? "세트에 해설을 적지 않은 문항이에요"}
            </p>
          </section>
        )}

        <section className="mt-auto flex flex-col gap-2.5 border-t border-line-soft pt-3.5">
          <h3 className="text-label-md text-muted-foreground">선생님 코멘트</h3>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="학생 전체에게 남길 첨삭을 적어 주세요"
            className="h-21 w-full resize-none rounded-lg bg-muted p-3 text-label-md text-foreground outline-none placeholder:text-ink-disabled focus-visible:ring-2 focus-visible:ring-mint"
          />
          <button
            type="button"
            onClick={() => onSaveComment(comment.trim())}
            disabled={!canSaveComment || commentSaving || comment.trim() === ""}
            className="h-11 w-full rounded-[10px] bg-mint text-label-lg text-white transition-colors hover:bg-mint-dark disabled:pointer-events-none disabled:opacity-50"
          >
            {commentSaving ? <PendingLabel>저장하는 중…</PendingLabel> : "코멘트 저장"}
          </button>
          {commentError !== null && (
            <p role="alert" className="text-label-md text-negative">
              {commentError}
            </p>
          )}
        </section>
      </div>
    </section>
  );
}

function InsightRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p className="flex flex-col gap-1">
      <span className="text-label-md text-ink">{label}</span>
      <span className="text-label-md leading-relaxed text-muted-foreground">{children}</span>
    </p>
  );
}

function InsightList({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-label-md text-ink">{label}</span>
      <ul className="flex flex-col gap-0.5 pl-4 text-label-md leading-relaxed text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="list-disc">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
