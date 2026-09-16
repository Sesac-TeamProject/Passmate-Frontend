"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { QuestionTypeChip } from "./question-type-chip";
import type { EditorQuestion } from "./types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  questions: EditorQuestion[];
};

/**
 * W-03 "미리보기" — 확정 전에 학생이 볼 모습을 훑는 창.
 *
 * 정답·해설은 **선생님만 보는 자리**라 학생 화면과 달리 함께 그린다(확정 전 검토가 목적이다).
 */
export function PreviewDialog({ open, onOpenChange, title, questions }: Props) {
  const totalSeconds = questions.reduce((sum, q) => sum + q.seconds, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] w-[640px] max-w-[640px] flex-col gap-5 rounded-[20px] bg-card p-7 sm:max-w-[640px]">
        <div className="flex flex-col gap-1">
          <DialogTitle className="text-heading-md text-ink">{title}</DialogTitle>
          <DialogDescription className="text-body-md text-muted-foreground">
            {questions.length}문항 · 예상 {Math.ceil(totalSeconds / 60)}분 · 학생에게 보일 순서예요
          </DialogDescription>
        </div>

        {questions.length === 0 ? (
          <p className="rounded-[18px] border border-dashed px-5 py-8 text-center text-label-lg text-muted-foreground">
            아직 문항이 없어요
          </p>
        ) : (
          /*
            간격은 세 단계다 — 카드 사이(16) > 질문↔보기(16) > 보기끼리(8).
            전부 8로 두면 번호·질문·보기·해설이 한 덩어리로 붙어 보인다(세트 상세 "더 보기", 2026-09-16)
          */
          <ol className="flex flex-col gap-4 overflow-y-auto pr-1">
            {questions.map((q) => (
              <li key={q.id} className="flex flex-col rounded-[18px] border p-5">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-label-lg text-mint-dark">
                    {q.orderNo}
                  </span>
                  <QuestionTypeChip type={q.type} />
                  <span className="text-label-md text-muted-foreground">
                    {q.seconds}초 · {q.points}점
                  </span>
                </div>
                <p className="mt-3 text-body-md leading-relaxed text-ink">{q.prompt}</p>

                {q.choices.length > 0 && (
                  <ol className="mt-4 flex flex-col gap-2">
                    {q.choices.map((choice, i) => (
                      <li
                        // 보기는 순서로만 구분된다 — 본문이 겹칠 수 있어 인덱스를 키로 쓴다
                        key={i}
                        className={cn(
                          "rounded-xl px-3.5 py-2.5 text-label-lg",
                          choice === q.answer
                            ? "bg-success-soft text-success"
                            : "bg-muted text-ink",
                        )}
                      >
                        {String.fromCharCode(65 + i)}. {choice}
                      </li>
                    ))}
                  </ol>
                )}

                {/* 서술형은 보기가 없다 — 모범답안을 정답 자리에 그린다 */}
                {q.choices.length === 0 && q.answer !== "" && (
                  <p className="mt-4 rounded-xl bg-success-soft px-3.5 py-2.5 text-label-lg text-success">
                    {q.type === "essay" ? "모범답안" : "정답"} · {q.answer}
                  </p>
                )}

                {/* 해설은 보기와 다른 층이다 — 선으로 끊어 각주처럼 읽히게 한다 */}
                {q.explanation !== "" && (
                  <p className="mt-4 border-t pt-3 text-label-md leading-relaxed text-muted-foreground">
                    해설 · {q.explanation}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  );
}
