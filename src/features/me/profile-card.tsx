import { StudentAvatar } from "@/components/common/student-avatar";
import { ReputationBadge } from "@/components/common/reputation-badge";
import type { Profile } from "@/features/me/types";

type Props = { profile: Profile; joinedRooms: number; hostedRooms: number };

/** C-02 v3 프로필 카드 — 아바타 64 · 이름+명성 뱃지 · 이메일/가입월 · 우측 방 개수 한 줄 */
export function ProfileCard({ profile, joinedRooms, hostedRooms }: Props) {
  return (
    <section className="flex items-center gap-5 rounded-2xl border bg-card p-5">
      <StudentAvatar avatar={profile.avatar} size={64} />
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <h2 className="text-heading-md text-ink">{profile.name}</h2>
          {/* 서버가 등급을 아직 주지 않는다 — 없으면 뱃지를 그리지 않는다(Lv.1로 대체 금지) */}
          {profile.level ? (
            <ReputationBadge level={profile.level} title={profile.levelTitle ?? ""} />
          ) : null}
        </div>
        <span className="text-label-md text-muted-foreground">
          {profile.email} · {profile.joinedLabel}
        </span>
      </div>
      <div className="flex-1" />
      <span className="shrink-0 text-label-md text-muted-foreground">
        참여한 방 {joinedRooms} · 내가 만든 방 {hostedRooms}
      </span>
    </section>
  );
}
