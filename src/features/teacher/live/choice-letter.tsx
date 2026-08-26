import type { ChoiceKey } from "@/features/teacher/mock";
import { cn } from "@/lib/utils";

/** 선택지 A~D 색 (globals.css choice 토큰). muted=true면 정답이 아닌 선택지 톤 */
export const CHOICE_CLASS: Record<ChoiceKey, { solid: string; muted: string; bar: string }> = {
  A: {
    solid: "bg-choice-a text-choice-a-foreground",
    muted: "bg-choice-a/40 text-choice-a-foreground",
    bar: "bg-choice-a",
  },
  B: {
    solid: "bg-choice-b text-choice-b-foreground",
    muted: "bg-choice-b/40 text-choice-b-foreground",
    bar: "bg-choice-b",
  },
  C: {
    solid: "bg-choice-c text-choice-c-foreground",
    muted: "bg-choice-c/40 text-choice-c-foreground",
    bar: "bg-choice-c",
  },
  D: {
    solid: "bg-choice-d text-choice-d-foreground",
    muted: "bg-choice-d/40 text-choice-d-foreground",
    bar: "bg-choice-d",
  },
};

type Props = { choice: ChoiceKey; muted?: boolean; className?: string };

/** 선택지 글자 타일 (기본 40px) */
export function ChoiceLetter({ choice, muted = false, className }: Props) {
  return (
    <span
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl text-lg font-black",
        muted ? CHOICE_CLASS[choice].muted : CHOICE_CLASS[choice].solid,
        className,
      )}
    >
      {choice}
    </span>
  );
}
