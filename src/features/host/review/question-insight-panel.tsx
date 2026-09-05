"use client";

import { useState } from "react";
import type { QuestionInsight, ReportQuestion } from "@/features/host/types";
import { QUESTION_TYPE_LABEL } from "@/features/host/editor/question-type-chip";
import { cn } from "@/lib/utils";

type Props = {
  question: ReportQuestion;
  /** @draft 서버가 안 주면 채점 현황·AI 분석 칸이 접힌다 */
  insight: QuestionInsight | null;
  /**
   * **문항 단위** 코멘트 저장 계약이 없다 — 서버에 있는 첨삭은 답안 단위
   * (`PUT /rooms/{roomId}/answers/{answerId}/review`)뿐이라 이 칸은 저장할 곳이 없다.
   * false면 버튼을 잠그고 이유를 적는다(2026-09-04 백엔드 소스 확인).
   */
  canSaveComment: boolean;
  onSaveComment: (text: string) => void;
};

/** W-07 우측 문항 상세 — 채점 현황 · AI 분석 · 선생님 코멘트 (시안 784:8983) */
export function QuestionInsightPanel({ question, insight, canSaveComment, onSaveComment }: Props) {
  const [comment, setComment] = useState(insight?.hostComment ?? "");

  const accuracyLabel =
    question.accuracy === undefined ? "채점 중" : `정답률 ${question.accuracy}%`;
  const peak = Math.max(...(insight?.gradingBreakdown ?? []).map((row) => row.count), 1);

  const handleSave = () => {
    onSaveComment(comment.trim());
  };

  return (
    <section className="flex w-[424px] shrink-0 flex-col overflow-hidden rounded-lg border bg-card">
      <h2 className="flex h-[46px] items-center bg-ink px-[17px] text-label-lg text-white">
        Q{question.index} · {QUESTION_TYPE_LABEL[question.type]} · {accuracyLabel}
      </h2>

      <div className="flex flex-1 flex-col gap-4 px-[17px] py-4">
        <p className="text-label-lg text-ink">{question.prompt ?? question.title}</p>

        {insight !== null && insight.gradingBreakdown.length > 0 && (
          <section className="flex flex-col gap-2.5 border-t border-line-soft pt-3.5">
            <h3 className="text-label-md text-muted-foreground">채점 현황</h3>
            {insight.gradingBreakdown.map((row, i) => (
              <p key={row.label} className="flex items-center gap-2.5">
                <span className="w-[90px] shrink-0 text-label-md text-ink">{row.label}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-line-soft">
                  <span
                    className={cn("block h-full rounded-full", BREAKDOWN_FILL[i] ?? "bg-muted")}
                    style={{ width: `${(row.count / peak) * 100}%` }}
                  />
                </span>
                <span className="w-13 shrink-0 text-right text-label-md text-ink">
                  {row.count}명
                </span>
              </p>
            ))}
          </section>
        )}

        {insight !== null && hasAnalysis(insight) && (
          <section className="flex flex-col gap-3 border-t border-line-soft pt-3.5">
            <h3 className="text-label-md text-mint-dark">AI 분석 (참고 의견)</h3>
            <AnalysisRow label="잘한 점" value={insight.strengths} />
            <AnalysisRow label="공통 누락" value={insight.commonMisses} />
            <AnalysisRow label="다음 방 제안" value={insight.nextRoomSuggestion} />
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
            onClick={handleSave}
            disabled={!canSaveComment || comment.trim() === ""}
            className="h-11 w-full rounded-[10px] bg-mint text-label-lg text-white transition-colors hover:bg-mint-dark disabled:pointer-events-none disabled:opacity-50"
          >
            코멘트 저장
          </button>
          {!canSaveComment && (
            <p className="text-label-md text-muted-foreground">
              지금은 학생별 답안에만 첨삭을 남길 수 있어요. 아래 학생 탭에서 답안을 골라 주세요
            </p>
          )}
        </section>
      </div>
    </section>
  );
}

/** 채점 현황 막대 색 — 시안은 위에서부터 민트 · 앰버 · 핑크 */
const BREAKDOWN_FILL = ["bg-mint", "bg-choice-c", "bg-choice-a"];

function hasAnalysis(insight: QuestionInsight): boolean {
  return (
    insight.strengths !== null ||
    insight.commonMisses !== null ||
    insight.nextRoomSuggestion !== null
  );
}

function AnalysisRow({ label, value }: { label: string; value: string | null }) {
  if (value === null) return null;

  return (
    <p className="flex flex-col gap-1">
      <span className="text-label-md text-ink">{label}</span>
      <span className="text-label-md text-muted-foreground">{value}</span>
    </p>
  );
}
