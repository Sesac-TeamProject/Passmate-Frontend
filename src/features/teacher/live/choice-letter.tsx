import { clsx } from "clsx";
import type { ChoiceKey } from "@/features/teacher/mock";

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

/**
 * 선택지 글자 타일 (40px · radius 12 · heading-md).
 * twMerge가 `text-heading-md`를 글자색으로 오인해 색 클래스와 충돌시키므로 clsx로 합친다.
 */
export function ChoiceLetter({ choice, muted = false, className }: Props) {
  return (
    <span
      className={clsx(
        "flex size-10 shrink-0 items-center justify-center rounded-xl text-heading-md",
        muted ? CHOICE_CLASS[choice].muted : CHOICE_CLASS[choice].solid,
        className,
      )}
    >
      {choice}
    </span>
  );
}
