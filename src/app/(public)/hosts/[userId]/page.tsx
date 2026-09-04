"use client";

import { useParams } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toHostRooms } from "@/features/host/profile/adapt";
import { HostProfilePage } from "@/features/host/profile/host-profile-page";
import { toEarnedAchievement } from "@/features/me/adapt";
import { useHostProfile } from "@/lib/queries/use-me";
import { toAvatarKey } from "@/lib/types/dto";

/** M-10 선생님 공개 프로필 컨테이너 — 인기 방 카드에서 선생님 이름을 누르면 온다 */
export default function Page() {
  const params = useParams<{ userId: string }>();
  const userId = Number(params.userId);

  const profile = useHostProfile(Number.isFinite(userId) ? userId : null);

  if (profile.isPending) return <ScreenLoading />;
  if (profile.isError)
    return <ScreenError message={profile.error.message} onRetry={() => profile.refetch()} />;

  return (
    <HostProfilePage
      nickname={profile.data.nickname}
      avatar={toAvatarKey(profile.data.defaultAvatarId)}
      // 계약에 한 줄 소개가 없다 — 화면이 그 줄을 감춘다
      intro={null}
      level={profile.data.level}
      // 등급 이름은 서버가 준다 — 화면이 자체 표를 들지 않는다
      levelTitle={profile.data.levelName}
      avgStars={profile.data.avgRating ?? null}
      roomCount={profile.data.roomsHosted}
      totalStudents={profile.data.totalStudents}
      badges={profile.data.badges.map((badge) => toEarnedAchievement(badge.code))}
      rooms={toHostRooms(profile.data.openRooms)}
    />
  );
}
