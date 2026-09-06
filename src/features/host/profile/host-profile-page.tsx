import Link from "next/link";
import { AchievementBadge } from "@/features/me/achievement-badge";
import { LevelEmblem } from "@/features/me/level-emblem";
import type { Achievement } from "@/features/me/types";
import { ReputationBadge } from "@/components/common/reputation-badge";
import { StatusChip } from "@/components/common/status-chip";
import { StudentAvatar } from "@/components/common/student-avatar";
import type { AvatarKey } from "@/lib/types/dto";
import { formatWon } from "@/lib/format";

/** 프로필에 늘어놓는 방 카드 수 — 넘치면 "전체 보기"로 보낸다 */
const ROOM_LIMIT = 3;

export type HostRoom = {
  roomId: number;
  title: string;
  isPaid: boolean;
  /** 참가비(코인). 무료면 null */
  entryFee: number | null;
  /** "오늘 20:00 · 8문항 · 12명 대기" */
  meta: string;
};

type Props = {
  nickname: string;
  /** 캐릭터 아바타. 서버가 고른 적 없으면 기본값으로 접힌다 */
  avatar: AvatarKey;
  /** 한 줄 소개. 없으면 감춘다 */
  intro: string | null;
  level: number;
  /** 레벨 칭호. 계약에 없으면 감춘다 */
  levelTitle: string | undefined;
  avgStars: number | null;
  roomCount: number;
  totalStudents: number;
  badges: Achievement[];
  rooms: HostRoom[];
};

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <li className="flex flex-1 flex-col items-center gap-0.5">
      <span className="text-heading-sm">{value}</span>
      <span className="text-label-md text-muted-foreground">{label}</span>
    </li>
  );
}

/**
 * M-10 선생님 공개 프로필 (앱 시안 → 데스크톱 웹 이식).
 * 앱은 홈 위에 겹치는 바텀시트지만, 웹은 주소로 바로 열 수 있어야 해서 화면 하나로 옮겼다.
 */
export function HostProfilePage({
  nickname,
  avatar,
  intro,
  level,
  levelTitle,
  avgStars,
  roomCount,
  totalStudents,
  badges,
  rooms,
}: Props) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-3.5 px-5 py-10">
      <div className="flex items-center gap-3.5">
        {/* 시안대로 캐릭터 아바타. `HostProfileResponse.defaultAvatarId`가 생겨 이니셜 타일을
            걷어냈다 (DESIGN_GAPS D-19 해소, 2026-09-04) */}
        <StudentAvatar avatar={avatar} size={64} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="truncate text-heading-md">{nickname} 선생님</h1>
          {levelTitle && (
            <ReputationBadge level={level} title={levelTitle} className="self-start" />
          )}
          {intro && <p className="truncate text-label-md text-muted-foreground">{intro}</p>}
        </div>
        <LevelEmblem level={level} size={44} />
      </div>

      <ul className="flex items-center rounded-2xl bg-muted px-2 py-3">
        <Stat value={avgStars === null ? "—" : avgStars.toFixed(1)} label="평균 평가" />
        <Stat value={`${roomCount}회`} label="방 운영" />
        <Stat value={`${totalStudents}명`} label="누적 학생" />
      </ul>

      {badges.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-label-lg">획득한 뱃지</h2>
            <span className="text-label-lg text-mint-dark">{badges.length}개</span>
          </div>
          <ul className="flex flex-wrap items-center gap-2">
            {badges.map((badge) => (
              <li key={badge.id}>
                <AchievementBadge badge={badge} />
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-label-lg">운영 중인 방</h2>
        <Link href="/rooms" className="text-label-lg text-mint-dark hover:underline">
          전체 보기 ›
        </Link>
      </div>

      {rooms.length === 0 ? (
        <p className="text-label-md text-muted-foreground">지금은 열려 있는 방이 없어요</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {rooms.slice(0, ROOM_LIMIT).map((room) => (
            <li
              key={room.roomId}
              className="flex items-center gap-2.5 rounded-2xl border bg-card px-3.5 py-3"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-label-lg">{room.title}</span>
                  {/* 칩을 직접 그리다 무료 방까지 유료색(주황)으로 칠하고 있었다 — 공용 칩으로 되돌린다 */}
                  <StatusChip tone={room.isPaid ? "paid" : "free"}>
                    {room.isPaid ? "유료" : "무료"}
                  </StatusChip>
                </span>
                <span className="truncate text-label-md text-muted-foreground">{room.meta}</span>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-0.5">
                {room.entryFee !== null && (
                  <span className="text-label-lg text-mint-dark">
                    {formatWon(room.entryFee, true)}
                  </span>
                )}
                <Link
                  // 공개 방 카드에는 PIN이 없다(DESIGN_GAPS N-1) — PIN 입력 화면으로 보낸다
                  href="/join"
                  className="rounded-[10px] bg-mint px-3 py-1.5 text-label-lg text-white transition-colors hover:bg-mint-dark"
                >
                  참여하기
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* TODO(API): 신고는 POST /reports 계약이 있지만 프로필에서 여는 UI는 시안에 흐름이 없다 */}
      <p className="mt-2 text-center text-label-md text-ink-disabled">프로필 신고 · 차단</p>
    </main>
  );
}
