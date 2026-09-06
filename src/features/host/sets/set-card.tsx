import Link from "next/link";
import { InitialTile } from "@/components/common/initial-tile";
import type { QuestionSet } from "@/features/host/types";
import { cn } from "@/lib/utils";

type Props = {
  set: QuestionSet;
  selected: boolean;
  onSelect: () => void;
  onClone: () => void;
  cloning?: boolean;
  onDelete: () => void;
  /** 삭제 요청 중 — 버튼을 잠근다 */
  deleting?: boolean;
};

/** W-08 문제 세트 카드 */
export function SetCard({
  set,
  selected,
  onSelect,
  onClone,
  cloning,
  onDelete,
  deleting = false,
}: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect();
      }}
      className={cn(
        "flex cursor-pointer flex-col gap-2.5 rounded-[20px] border bg-card px-5 pt-[18px] pb-4 transition-colors hover:border-mint",
        selected && "border-mint",
      )}
    >
      <div className="flex items-center gap-2">
        <InitialTile label={set.tile.label} tone={set.tile.tone} className="size-10 rounded-xl" />
        {set.isConfirmed === false && (
          <span className="rounded-full bg-orange-soft px-2 py-0.5 text-label-md text-orange">
            DRAFT
          </span>
        )}
      </div>
      <span className="text-heading-sm text-ink">{set.title}</span>
      {set.summary ? (
        <span className="text-label-md text-muted-foreground">{set.summary}</span>
      ) : null}
      <div className="flex items-center justify-between">
        <span className="text-label-md text-muted-foreground">
          {set.usage ? `${set.usage.count}회 사용 · ${set.usage.lastUsed}` : "미사용"}
        </span>
        <div className="flex gap-2.5 text-label-lg text-mint-dark">
          <button
            type="button"
            disabled={cloning}
            className="hover:underline disabled:opacity-60"
            onClick={(e) => {
              e.stopPropagation();
              onClone();
            }}
          >
            복제
          </button>
          <Link
            href="/host/rooms/new"
            className="hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            방 만들기
          </Link>
          <button
            type="button"
            disabled={deleting}
            className="text-muted-foreground hover:text-negative hover:underline disabled:opacity-60"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            {deleting ? "삭제하는 중…" : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}
