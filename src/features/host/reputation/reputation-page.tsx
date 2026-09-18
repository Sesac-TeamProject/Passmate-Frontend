import Link from "next/link";
import { MobileTopBar } from "@/components/common/mobile-top-bar";
import type { AvatarKey } from "@/components/common/student-avatar";
import type { BadgeType } from "@/lib/types/dto";
import { BadgeCollection } from "./badge-collection";
import { LevelLadder } from "./level-ladder";
import { MobileLevelCard } from "./mobile-level-card";
import { NextLevelCard, type LevelCriterion } from "./next-level-card";
import { PaidRoomCta } from "./paid-room-cta";
import { ReputationProfileCard } from "./reputation-profile-card";

/** 폰 프로필 카드에 필요한 내 정보. 아직 못 읽었으면 null — 카드만 빠지고 나머지는 그린다 */
export type ReputationProfile = {
  nickname: string;
  avatar: AvatarKey;
  statsLine: string;
};

type Props = {
  currentLevel: number;
  /** 현재 레벨 칭호. 예: "성장" */
  currentTitle: string;
  progress: number;
  achievedLabel: string;
  nextLevel: number;
  nextTitle: string;
  criteria: LevelCriterion[];
  /** 유지 조건 안내. 없으면 감춘다 */
  note: string | null;
  /** 폰(M-09)이 레벨 카드 맨 아래 항상 두는 안내 한 줄 */
  mobileNote: string;
  earnedBadges: Set<BadgeType>;
  profile: ReputationProfile | null;
};

/**
 * 명성 · 뱃지 — 웹 W-14(시안 808:8758)와 앱 M-09(시안 349:9770).
 *
 * 두 시안이 같은 내용을 다르게 세운다. PC는 레벨 사다리 5단계 + 승급 조건 2열이고,
 * 폰은 프로필 카드 · 레벨 카드 한 장 · 4열 뱃지 · 하단 CTA다.
 * 그래서 레벨 부분만 `md:hidden` / `max-md:hidden` 으로 갈라 두고 뱃지는 한 벌을 공유한다.
 * 렌더 전용.
 */
export function ReputationPage({
  currentLevel,
  currentTitle,
  progress,
  achievedLabel,
  nextLevel,
  nextTitle,
  criteria,
  note,
  mobileNote,
  earnedBadges,
  profile,
}: Props) {
  // 최고 등급이면 다음 레벨이 없다 — 폰 카드는 진행 바와 "다음 레벨 …" 줄을 통째로 뺀다
  const hasNextLevel = nextLevel > currentLevel;

  return (
    // 시안 W-14는 본문 1090 (좌 60 · 우 50) — 넓은 화면에서 카드가 늘어나지 않게 폭을 묶는다
    <main className="min-h-screen bg-background px-[60px] pt-10 pb-10 max-md:min-h-dvh max-md:bg-card max-md:px-5 max-md:pt-3 max-md:pb-5">
      {/* W-09와 같은 규칙 — 폭을 묶고 남는 공간은 좌우로 나눈다 */}
      <div className="mx-auto flex max-w-[1090px] flex-col gap-6 max-md:gap-3">
        <div className="flex flex-col gap-2 max-md:contents">
          <MobileTopBar title="명성 · 뱃지" backHref="/host/rooms" className="pb-1" />
          <Link
            href="/host/rooms"
            className="self-start text-label-md text-muted-foreground transition-colors hover:text-foreground max-md:hidden"
          >
            ‹ 내가 만든 방으로
          </Link>
          <h1 className="text-heading-lg text-ink max-md:hidden">명성 · 뱃지</h1>
        </div>

        {profile !== null && (
          <ReputationProfileCard
            nickname={profile.nickname}
            avatar={profile.avatar}
            statsLine={profile.statsLine}
            level={currentLevel}
            levelTitle={currentTitle}
          />
        )}

        <MobileLevelCard
          currentLevel={currentLevel}
          currentTitle={currentTitle}
          progress={progress}
          nextLevel={hasNextLevel ? nextLevel : null}
          nextTitle={nextTitle}
          criteria={criteria}
          note={mobileNote}
        />

        <div className="flex flex-col gap-6 max-md:hidden">
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
        </div>

        <BadgeCollection earned={earnedBadges} />

        <PaidRoomCta currentLevel={currentLevel} />
      </div>
    </main>
  );
}
