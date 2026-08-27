import { GuestCard } from "@/features/me/guest-card";
import { HostCard } from "@/features/me/host-card";
import { HOST_RECORD, LEARNING_RECORD, PROFILE } from "@/features/me/mock";
import { ProfileCard } from "@/features/me/profile-card";

/** C-02 v2 마이페이지 — 한 계정의 개설한 방(host) · 참여한 방(client) 한눈에 */
export function MyPage() {
  return (
    <main className="flex flex-col gap-5 px-9 py-7">
      <div className="flex items-center justify-between">
        <h1 className="text-heading-lg text-ink">{PROFILE.name} 님의 마이페이지</h1>
        <p className="text-label-md text-muted-foreground">
          모든 사용자는 학생으로 시작해 명성을 쌓으면 선생님으로 활동할 수 있어요
        </p>
      </div>

      <ProfileCard profile={PROFILE} host={HOST_RECORD} learning={LEARNING_RECORD} />

      <div className="flex gap-5">
        <HostCard profile={PROFILE} host={HOST_RECORD} />
        <GuestCard profile={PROFILE} learning={LEARNING_RECORD} />
      </div>
    </main>
  );
}
