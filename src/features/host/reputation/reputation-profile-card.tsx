import { ReputationBadge } from "@/components/common/reputation-badge";
import { StudentAvatar, type AvatarKey } from "@/components/common/student-avatar";

type Props = {
  nickname: string;
  avatar: AvatarKey;
  /** "참여 18회 · 평균 정답률 72% · 방 운영 12회" */
  statsLine: string;
  level: number;
  /** 레벨 칭호. 예: "검증된 운영자" */
  levelTitle: string;
};

/**
 * M-09 프로필 카드 (349:9775) — 아바타 56 · 이름 + 명성 칩 · 지표 한 줄.
 * 앱에만 있는 카드라 **폰 전용**이다(PC W-14는 제목 아래 바로 레벨 카드로 간다).
 */
export function ReputationProfileCard({ nickname, avatar, statsLine, level, levelTitle }: Props) {
  return (
    <section className="flex items-center gap-3.5 rounded-[20px] border bg-card px-[18px] py-4 md:hidden">
      <StudentAvatar avatar={avatar} size={56} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-heading-sm text-ink">{nickname}</h2>
          <ReputationBadge level={level} title={levelTitle} />
        </div>
        <span className="text-label-md text-muted-foreground">{statsLine}</span>
      </div>
    </section>
  );
}
