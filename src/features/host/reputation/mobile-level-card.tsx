import { LevelEmblem } from "@/features/me/level-emblem";
import { HOST_SHARE, PAID_ROOM_MIN_LEVEL } from "@/features/host/room-flow/adapt";
import { cn } from "@/lib/utils";
import { toCriterionGoal, toCriterionProgress } from "./adapt";
import type { LevelCriterion } from "./next-level-card";

type Props = {
  currentLevel: number;
  /** 현재 레벨 칭호. 예: "성장" */
  currentTitle: string;
  /** 다음 레벨까지 진행률(%) */
  progress: number;
  /** 다음 레벨. 최고 등급이면 null */
  nextLevel: number | null;
  nextTitle: string;
  criteria: LevelCriterion[];
  /** 유지 조건 안내 한 줄 */
  note: string;
};

/**
 * M-09 레벨 카드 (349:9782) — 엠블럼 · 진행 바 · 혜택 안내 · 승급 조건 행.
 * **폰 전용**이다. PC(W-14)는 같은 내용을 레벨 사다리 + 다음 레벨 카드 둘로 나눠 그린다.
 */
export function MobileLevelCard({
  currentLevel,
  currentTitle,
  progress,
  nextLevel,
  nextTitle,
  criteria,
  note,
}: Props) {
  // 유료 방 개설이 아직 앞에 남은 선생님에게만 혜택 줄을 띄운다 — 이미 열렸으면 안내가 아니라 잔소리다
  const paidRoomAhead = currentLevel < PAID_ROOM_MIN_LEVEL;

  return (
    <section className="flex flex-col gap-3 rounded-[20px] border bg-card px-[18px] py-4 md:hidden">
      <div className="flex items-center gap-3">
        <LevelEmblem level={currentLevel} size={48} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-heading-sm text-ink">
            Lv.{currentLevel} {currentTitle}
          </span>
          {nextLevel !== null && (
            <span className="text-label-md text-muted-foreground">
              다음 레벨 Lv.{nextLevel} {nextTitle}까지 {progress}%
            </span>
          )}
        </div>
        {nextLevel !== null && <span className="text-label-lg text-mint-dark">{progress}%</span>}
      </div>

      {nextLevel !== null && (
        <span className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <span className="block h-full rounded-full bg-mint" style={{ width: `${progress}%` }} />
        </span>
      )}

      {paidRoomAhead && (
        <p className="flex items-center gap-2 rounded-xl bg-mint-bg px-3 py-2.5 text-label-lg text-mint-deep">
          <LevelEmblem level={PAID_ROOM_MIN_LEVEL} size={24} />
          Lv.{PAID_ROOM_MIN_LEVEL}이 되면 유료 방을 열고 참가비의 {Math.round(HOST_SHARE * 100)}%를
          정산받아요
        </p>
      )}

      {criteria.map((criterion) => (
        <p key={criterion.label} className="flex items-center justify-between gap-3">
          <span className="text-label-lg text-ink">{toCriterionGoal(criterion)}</span>
          <span
            className={cn(
              "shrink-0 text-label-lg",
              criterion.met ? "text-mint-dark" : "text-orange",
            )}
          >
            {toCriterionProgress(criterion)}
          </span>
        </p>
      ))}

      <p className="text-label-lg text-muted-foreground">{note}</p>
    </section>
  );
}
