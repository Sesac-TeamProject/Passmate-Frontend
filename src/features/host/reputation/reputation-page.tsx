import Link from "next/link";
import type { BadgeType } from "@/lib/types/dto";
import { BadgeCollection } from "./badge-collection";
import { LevelLadder } from "./level-ladder";
import { NextLevelCard, type LevelCriterion } from "./next-level-card";

type Props = {
  currentLevel: number;
  progress: number;
  achievedLabel: string;
  nextLevel: number;
  nextTitle: string;
  criteria: LevelCriterion[];
  /** 유지 조건 안내. 없으면 감춘다 */
  note: string | null;
  earnedBadges: Set<BadgeType>;
};

/** W-14 명성 · 뱃지 상세 (시안 808:8758). 렌더 전용 */
export function ReputationPage({
  currentLevel,
  progress,
  achievedLabel,
  nextLevel,
  nextTitle,
  criteria,
  note,
  earnedBadges,
}: Props) {
  return (
    <main className="flex min-h-screen flex-col gap-6 bg-background px-[60px] pt-10 pb-10">
      <div className="flex flex-col gap-2">
        <Link
          href="/host/rooms"
          className="self-start text-label-md text-muted-foreground transition-colors hover:text-foreground"
        >
          ‹ 내가 만든 방으로
        </Link>
        <h1 className="text-heading-lg text-ink">명성 · 뱃지</h1>
      </div>

      <LevelLadder currentLevel={currentLevel} progress={progress} achievedLabel={achievedLabel} />

      <NextLevelCard
        targetLevel={nextLevel}
        targetTitle={nextTitle}
        criteria={criteria}
        note={note}
      />

      <BadgeCollection earned={earnedBadges} />
    </main>
  );
}
