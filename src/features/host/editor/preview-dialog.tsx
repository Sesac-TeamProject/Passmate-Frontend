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
      <DialogContent className="flex max-h-[80vh] w-[640px] max-w-[640px] flex-col gap-3 rounded-[20px] bg-card p-7 sm:max-w-[640px]">
        <DialogTitle className="text-heading-md text-ink">{title}</DialogTitle>
        <DialogDescription className="text-body-md text-muted-foreground">
          {questions.length}문항 · 예상 {Math.ceil(totalSeconds / 60)}분 · 학생에게 보일 순서예요
        </DialogDescription>

        {questions.length === 0 ? (
          <p className="rounded-[18px] border border-dashed px-5 py-8 text-center text-label-lg text-muted-foreground">
            아직 문항이 없어요
          </p>
        ) : (
          <ol className="flex flex-col gap-3 overflow-y-auto">
            {questions.map((q) => (
              <li key={q.id} className="flex flex-col gap-2 rounded-[18px] border p-4">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-label-lg text-mint-dark">
                    {q.orderNo}
                  </span>
                  <QuestionTypeChip type={q.type} />
                  <span className="text-label-md text-muted-foreground">
                    {q.seconds}초 · {q.points}점
                  </span>
                </div>
                <p className="text-body-md text-ink">{q.prompt}</p>

                {q.choices.length > 0 && (
                  <ol className="flex flex-col gap-1.5">
                    {q.choices.map((choice, i) => (
                      <li
                        // 보기는 순서로만 구분된다 — 본문이 겹칠 수 있어 인덱스를 키로 쓴다
                        key={i}
                        className={cn(
                          "rounded-xl px-3.5 py-2 text-label-lg",
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
                  <p className="rounded-xl bg-success-soft px-3.5 py-2 text-label-lg text-success">
                    {q.type === "essay" ? "모범답안" : "정답"} · {q.answer}
                  </p>
                )}

                {q.explanation !== "" && (
                  <p className="text-label-md text-muted-foreground">해설 · {q.explanation}</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  );
}
