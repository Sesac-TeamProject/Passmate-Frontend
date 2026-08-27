import { StudentAvatar } from "@/components/common/student-avatar";
import { LevelEmblem } from "@/features/me/level-emblem";
import type { HostRecord, LearningRecord, Profile } from "@/features/me/mock";

type Props = { profile: Profile; host: HostRecord; learning: LearningRecord };

/** 프로필 카드 — 한 계정의 두 역할(개설·참여) 요약 */
export function ProfileCard({ profile, host, learning }: Props) {
  return (
    <section className="flex items-center gap-5 rounded-2xl border bg-card p-5">
      <StudentAvatar avatar={profile.avatar} size={64} />
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <h2 className="text-heading-md text-ink">{profile.name}</h2>
          <span className="flex items-center gap-1 rounded-full bg-mint-tint py-1 pr-2.5 pl-[5px] text-label-lg text-mint-deep">
            <LevelEmblem size={14} />
            Lv.{profile.level} {profile.levelTitle}
          </span>
        </div>
        <span className="text-label-md text-muted-foreground">
          {profile.email} · {profile.joinedLabel}
        </span>
      </div>
      <div className="flex-1" />
      <div className="flex shrink-0 flex-col items-end gap-1 text-label-md text-muted-foreground">
        <span>
          참여한 방 {learning.stats.sessions} · 정답률 {learning.stats.accuracy}% · 평균{" "}
          {learning.stats.averageRank}위
        </span>
        <span>
          개설한 방 {host.stats.rooms} · 별점 {host.stats.rating} · 학생 {host.stats.students}명
        </span>
      </div>
    </section>
  );
}
