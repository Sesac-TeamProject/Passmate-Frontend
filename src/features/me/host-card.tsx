import { Key } from "lucide-react";
import Link from "next/link";
import { AchievementBadge } from "@/features/me/achievement-badge";
import { LevelEmblem } from "@/features/me/level-emblem";
import type { HostRecord, Profile } from "@/features/me/mock";
import { StatTile } from "@/features/me/stat-tile";

type Props = { profile: Profile; host: HostRecord };

/** 개설한 방 — host로서의 명성·실적·뱃지·정산 진입 */
export function HostCard({ profile, host }: Props) {
  return (
    <section className="flex min-w-0 flex-1 flex-col gap-3.5 rounded-2xl border bg-card p-5">
      <header className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-heading-sm text-ink">
          <Key aria-hidden className="size-5 text-mint" strokeWidth={2} />
          개설한 방
        </h2>
        {/* TODO(API): 명성·뱃지 상세 화면 — 디자인 미정 */}
        <Link href="#" className="text-label-md text-mint-dark">
          명성 · 뱃지 더보기 ›
        </Link>
      </header>

      <div className="flex items-center gap-3">
        <LevelEmblem size={48} />
        <div className="flex flex-col gap-0.5">
          <span className="text-label-lg text-ink">
            Lv.{profile.level} {profile.levelTitle} — {profile.levelPerk}
          </span>
          <span className="text-label-md text-muted-foreground">
            Lv.{profile.nextLevel.level}까지 방 운영 {profile.nextLevel.roomsLeft}회 · 학생{" "}
            {profile.nextLevel.studentsLeft}명 남음
          </span>
        </div>
      </div>
      <div
        role="progressbar"
        aria-valuenow={profile.progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Lv.${profile.nextLevel.level}까지 진행률`}
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full rounded-full bg-mint" style={{ width: `${profile.progress}%` }} />
      </div>

      <div className="flex gap-3">
        <StatTile label="방 운영" value={`${host.stats.rooms}회`} />
        <StatTile label="평균 별점" value={String(host.stats.rating)} />
        <StatTile label="총 학생 수" value={`${host.stats.students}명`} />
      </div>

      <div className="flex items-center justify-between text-label-md text-muted-foreground">
        <span>내 뱃지</span>
        <span>
          {host.badges.earned} / {host.badges.total}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {host.badges.items.map((b) => (
          <AchievementBadge key={b.id} badge={b} />
        ))}
        <span className="text-label-md text-ink-disabled">+{host.badges.locked} 잠김</span>
      </div>

      <div className="h-px bg-border" />

      <Link href="/teacher/dashboard" className="flex items-center justify-between">
        <span className="text-label-lg text-ink">지금 열려 있는 방</span>
        <span className="text-label-md text-mint-dark">{host.openRooms}개 ›</span>
      </Link>
      <Link href="/teacher/revenue" className="flex items-center justify-between">
        <span className="text-label-lg text-ink">정산</span>
        <span className="text-label-md text-mint-dark">
          이번 달 ₩{host.settlementThisMonth.toLocaleString()} ›
        </span>
      </Link>

      <div className="flex gap-2.5">
        <Link
          href="/teacher/rooms/new"
          className="flex items-center justify-center rounded-xl bg-mint px-5 py-3 text-label-lg text-white transition-colors hover:bg-mint-dark"
        >
          방 만들기
        </Link>
        <Link
          href="/teacher/sets"
          className="flex items-center justify-center rounded-xl bg-mint-bg px-5 py-3 text-label-lg text-mint-dark transition-colors hover:bg-mint-tint"
        >
          문제 세트 관리
        </Link>
      </div>
    </section>
  );
}
