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
    // 시안 W-14는 본문 1090 (좌 60 · 우 50) — 넓은 화면에서 카드가 늘어나지 않게 폭을 묶는다
    <main className="min-h-screen bg-background pt-10 pr-[50px] pb-10 pl-[60px]">
      <div className="flex max-w-[1090px] flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Link
            href="/host/rooms"
            className="self-start text-label-md text-muted-foreground transition-colors hover:text-foreground"
          >
            ‹ 내가 만든 방으로
          </Link>
          <h1 className="text-heading-lg text-ink">명성 · 뱃지</h1>
        </div>

        <LevelLadder
          currentLevel={currentLevel}
          progress={progress}
          achievedLabel={achievedLabel}
        />

        <NextLevelCard
          targetLevel={nextLevel}
          targetTitle={nextTitle}
          criteria={criteria}
          note={note}
        />

        <BadgeCollection earned={earnedBadges} />
      </div>
    </main>
  );
}
