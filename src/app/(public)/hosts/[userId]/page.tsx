"use client";

import { useParams } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toHostRooms } from "@/features/host/profile/adapt";
import { HostProfilePage } from "@/features/host/profile/host-profile-page";
import { toEarnedAchievement } from "@/features/me/adapt";
import { levelTitle } from "@/lib/host-level";
import { useHostProfile } from "@/lib/queries/use-me";

/** M-10 선생님 공개 프로필 컨테이너 — 인기 방 카드에서 선생님 이름을 누르면 온다 */
export default function Page() {
  const params = useParams<{ userId: string }>();
  const userId = Number(params.userId);

  const profile = useHostProfile(Number.isFinite(userId) ? userId : null);

  if (profile.isPending) return <ScreenLoading />;
  if (profile.isError)
    return <ScreenError message={profile.error.message} onRetry={() => profile.refetch()} />;

  const level = profile.data.level ?? 1;

  return (
    <HostProfilePage
      nickname={profile.data.nickname ?? ""}
      intro={profile.data.intro ?? null}
      level={level}
      levelTitle={levelTitle(level)}
      avgStars={profile.data.avgStars ?? null}
      roomCount={profile.data.roomCount ?? 0}
      totalStudents={profile.data.totalStudents ?? 0}
      badges={(profile.data.badges ?? []).map(toEarnedAchievement)}
      rooms={toHostRooms(profile.data.rooms ?? [])}
    />
  );
}
