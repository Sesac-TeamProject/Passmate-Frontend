import type { QuestionType } from "@/features/host/mock";
import { cn } from "@/lib/utils";

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  multiple: "객관식",
  essay: "서술형",
  ox: "OX",
};

const CHIP_CLASS: Record<QuestionType, string> = {
  multiple: "bg-muted text-mint-dark",
  essay: "bg-[#deedff] text-[#0e61d9]",
  ox: "bg-[#fdefde] text-[#bf3f0c]",
};

/** 문항 유형 알약 칩 (객관식·서술형·OX) */
export function QuestionTypeChip({ type, className }: { type: QuestionType; className?: string }) {
  return (
    <span
      className={cn("shrink-0 rounded-full px-2.5 py-1 text-label-lg", CHIP_CLASS[type], className)}
    >
      {QUESTION_TYPE_LABEL[type]}
    </span>
  );
}
