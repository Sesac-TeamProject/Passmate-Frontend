import Link from "next/link";
import type { QuestionSet } from "@/features/host/types";
import { QUESTION_TYPE_LABEL } from "@/features/host/editor/question-type-chip";
import { cn } from "@/lib/utils";
import { PendingLabel } from "@/components/common/pending-label";

const CHIP: Record<QuestionSet["composition"][number]["type"], string> = {
  multiple: "bg-muted text-mint-dark",
  essay: "bg-blue-soft text-blue",
  ox: "bg-orange-soft text-orange",
};

type Props = { set: QuestionSet; onClone: () => void; cloning?: boolean };

/**
 * 요약 한 줄. 총 배점·예상 시간은 계약(GET /question-sets)에 없어 adapt가 0으로 채운다 —
 * 0을 그대로 찍으면 "총 배점 0 · 예상 0분"이 보이므로 값이 있는 조각만 이어 붙인다.
 */
function metaLine(set: QuestionSet): string {
  const parts: string[] = [];

  if (set.totalPoints > 0) parts.push(`총 배점 ${set.totalPoints}`);
  if (set.minutes > 0) parts.push(`예상 ${set.minutes}분`);

  if (!set.usage) parts.push("미사용");
  else if (set.usage.lastUsed) parts.push(`마지막 사용 ${set.usage.lastUsed}`);
  else parts.push(`${set.usage.count}회 사용`);

  return parts.join(" · ");
}

/** W-08 우측 패널 — 선택한 세트 요약·문항 미리보기·재활용 액션 */
export function SetDetailPanel({ set, onClone, cloning }: Props) {
  const more = set.questionCount - set.preview.length;

  return (
    <aside className="flex w-[360px] shrink-0 flex-col gap-3 bg-card p-6">
      <h2 className="text-heading-md text-ink">{set.title}</h2>
      {set.composition.length > 0 && (
        <div className="flex gap-1.5">
          {set.composition.map((c) => (
            <span
              key={c.type}
              className={cn("rounded-full px-2.5 py-1 text-label-lg", CHIP[c.type])}
            >
              {QUESTION_TYPE_LABEL[c.type]} {c.count}
            </span>
          ))}
        </div>
      )}
      <p className="text-label-md text-muted-foreground">{metaLine(set)}</p>
      <hr className="border-muted" />
      {set.preview.length > 0 && (
        <>
          <h3 className="text-label-lg text-muted-foreground">문항 미리보기</h3>
          <ol className="flex flex-col">
            {set.preview.map((text, i) => (
              <li key={text} className="flex items-center gap-2.5 py-2 text-label-lg text-ink">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-muted text-label-lg text-mint-dark">
                  {i + 1}
                </span>
                {text}
              </li>
            ))}
          </ol>
          {more > 0 && <p className="text-label-md text-muted-foreground">··· {more}문항 더</p>}
        </>
      )}
      <div className="mt-auto flex flex-col gap-3">
        <Link
          href="/host/rooms/new"
          className="flex h-[50px] items-center justify-center rounded-[14px] bg-mint text-label-lg text-white transition-colors hover:bg-mint-dark"
        >
          이 세트로 방 만들기
        </Link>
        <button
          type="button"
          onClick={onClone}
          disabled={cloning}
          className="flex h-[46px] items-center justify-center rounded-[14px] bg-muted text-label-lg text-mint-dark transition-colors hover:bg-mint-tint disabled:opacity-60"
        >
          {cloning ? <PendingLabel>복제하는 중…</PendingLabel> : "복제해서 수정하기"}
        </button>
      </div>
    </aside>
  );
}
