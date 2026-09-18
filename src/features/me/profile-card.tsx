import { StudentAvatar } from "@/components/common/student-avatar";
import { ReputationBadge } from "@/components/common/reputation-badge";
import type { Profile } from "@/features/me/types";

type Props = { profile: Profile; joinedRooms: number; hostedRooms: number };

/**
 * C-02 v3 프로필 카드 — 아바타 64 · 이름+명성 뱃지 · 이메일/가입월 · 우측 방 개수 한 줄.
 *
 * 폰(앱 M-12)은 이 한 줄이 390px에 안 들어간다 — 아바타64+이름+뱃지+우측 방 개수 텍스트를 다 더하면
 * 카드 안쪽 폭(약 310px)을 넘긴다. PC 마크업은 `contents`로 그대로 두고(픽셀 그대로),
 * 폰 전용 마크업을 따로 둬 앱처럼 아바타+이름 줄 아래에 방 개수를 두 번째 줄로 쌓는다.
 * 이메일·가입월(웹만 가진 내용)은 지우지 않고 방 개수 위 줄에 그대로 남긴다.
 */
export function ProfileCard({ profile, joinedRooms, hostedRooms }: Props) {
  const badge = profile.level ? (
    // 등급은 GET /users/me/grade가 준다. 아직 안 왔으면 그리지 않는다(Lv.1로 대체 금지)
    <ReputationBadge level={profile.level} title={profile.levelTitle ?? ""} />
  ) : null;

  return (
    <section className="flex items-center gap-5 rounded-2xl border bg-card p-5 max-md:rounded-[20px] max-md:px-[18px] max-md:py-4">
      <div className="contents max-md:hidden">
        <StudentAvatar avatar={profile.avatar} size={64} />
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <h2 className="text-heading-md text-ink">{profile.name}</h2>
            {badge}
          </div>
          <span className="text-label-md text-muted-foreground">
            {profile.email} · {profile.joinedLabel}
          </span>
        </div>
        <div className="flex-1" />
        <span className="shrink-0 text-label-md text-muted-foreground">
          참여한 방 {joinedRooms} · 내가 만든 방 {hostedRooms}
        </span>
      </div>

      <div className="hidden items-center gap-3.5 max-md:flex">
        <StudentAvatar avatar={profile.avatar} size={56} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-heading-md text-ink">{profile.name}</h2>
            {badge}
          </div>
          <span className="truncate text-label-md text-muted-foreground">
            {profile.email} · {profile.joinedLabel}
          </span>
          <span className="text-label-md text-muted-foreground">
            참여한 방 {joinedRooms} · 내가 만든 방 {hostedRooms}
          </span>
        </div>
      </div>
    </section>
  );
}
