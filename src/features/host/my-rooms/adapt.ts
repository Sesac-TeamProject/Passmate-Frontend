import { formatPin, formatWon } from "@/lib/format";
import { parseServerDateTime } from "@/lib/datetime";
import { LEVEL_TITLE, levelTitle } from "@/lib/host-level";
import type { HostedRoomsResponse, HostReputation } from "@/lib/types/dto";
import type { HubAction } from "./hub-actions";
import type { HubStat } from "./hub-summary";
import { type LevelStatus, type MyRoom } from "./types";

/** 서버 시각(UTC naive) → "8/19 종료" 같은 짧은 라벨. 값이 없으면 undefined */
function toShortLabel(value: string | undefined, suffix: string): string | undefined {
  if (!value) return undefined;
  const date = parseServerDateTime(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return `${date.getMonth() + 1}/${date.getDate()} ${suffix}`;
}

/** 예정 시각 → "20:00 시작". 없으면 undefined */
function toStartsLabel(scheduledAt: string | undefined): string | undefined {
  if (!scheduledAt) return undefined;
  const date = parseServerDateTime(scheduledAt);
  if (Number.isNaN(date.getTime())) return undefined;
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm} 시작`;
}

/**
 * GET /users/me/rooms/hosted → 방 목록 카드.
 * 서버가 진행 중·종료를 **나눠서** 주므로 둘을 이어 붙여 한 목록으로 만든다.
 * 끝난 방에는 PIN이 없다(종료 후 재사용된다) — 카드가 PIN 칩을 그리지 않는다.
 */
export function toMyRooms(hosted: HostedRoomsResponse): MyRoom[] {
  const active: MyRoom[] = hosted.active.map((r) => ({
    code: r.pin,
    title: r.title,
    status: "live",
    students: r.participantCount,
    pin: r.pin,
    startsLabel: toStartsLabel(r.scheduledAt),
    reportId: String(r.roomId),
  }));

  const ended: MyRoom[] = hosted.ended.map((r) => ({
    code: String(r.roomId),
    title: r.title,
    status: "ended",
    students: r.studentCount,
    endedLabel: toShortLabel(r.endedAt, "종료"),
    averageScore: r.correctRate,
    reportId: String(r.roomId),
  }));

  return [...active, ...ended];
}

/** 레벨 카드 혜택 칩 — 필요 레벨 이상이면 획득 처리 */
const LEVEL_PERK_DEFS: { label: string; requiredLevel: number }[] = [
  { label: "유료 방 개설 (Lv.3)", requiredLevel: 3 },
  { label: "프로필 뱃지 표시", requiredLevel: 1 },
  { label: "방 목록 상단 노출 (Lv.4)", requiredLevel: 4 },
  { label: "브랜디드 퀴즈 제안 (Lv.5)", requiredLevel: 5 },
];

/**
 * 명성 요약 → 현재 레벨 카드.
 *
 * **서버가 등급을 아직 계산하지 않는다** — `level`이 없으면 null을 돌려주고 화면이 카드를
 * 통째로 감춘다. Lv.1로 채우면 "새싹 등급을 받았다"는 없는 사실이 된다.
 */
export function toLevelStatus(reputation: HostReputation): LevelStatus | null {
  const level = reputation.level;
  if (level === undefined) return null;

  const nextLevel = Math.min(5, level + 1);
  const tail = level <= 3 ? "하락 없음 (영구)" : "30일 유지 판정";

  return {
    level,
    title: levelTitle(level) ?? LEVEL_TITLE[1],
    achievedLabel: tail,
    next: {
      level: nextLevel,
      title: levelTitle(nextLevel) ?? "",
      // 서버는 0~1로 준다 — 화면은 %로 그린다
      progress: Math.round((reputation.nextLevelProgress ?? 0) * 100),
    },
    perks: LEVEL_PERK_DEFS.map((p) => ({ label: p.label, earned: level >= p.requiredLevel })),
  };
}

/**
 * 명성 카드 부제 "방 운영 24회 · 평균 평가 4.6" — 없는 조각은 뺀다.
 * 값은 `/users/me/rooms/hosted`의 명성 요약에서 온다 — 방 목록과 같은 응답이라 더 부르지 않는다.
 */
export function toLevelSubtitle(reputation: HostReputation): string {
  const avgStars = reputation.averageStars;

  return [
    `방 운영 ${reputation.hostedSessionCount}회`,
    // 받은 평가가 없으면 서버가 필드를 빼고 보낸다 — 0.0으로 채우면 "0점을 받았다"가 된다
    avgStars === undefined ? null : `평균 평가 ${avgStars}`,
  ]
    .filter((part): part is string => part !== null)
    .join(" · ");
}

/** W-09 가운데 운영 실적 3줄 — 방 운영 횟수 · 평균 평가 · 이번 달 정산 예정 (시안 803:8803~8814) */
export function toHubStats(
  reputation: HostReputation,
  monthlyTotal: number | undefined,
): HubStat[] {
  const avgStars = reputation.averageStars;

  return [
    {
      id: "rooms",
      icon: "▦",
      value: `${reputation.hostedSessionCount}회`,
      description: "지금까지 방을 연 횟수예요",
    },
    {
      id: "stars",
      icon: "★",
      value: avgStars === undefined ? "—" : `${avgStars} / 5`,
      description: "학생들이 남긴 평균 평가예요",
    },
    {
      id: "settlement",
      icon: "₩",
      value: monthlyTotal === undefined ? "—" : formatWon(monthlyTotal),
      description: "이번 달 정산 예정 금액이에요",
    },
  ];
}

/** W-09 오른쪽 행동 카드 3장 — 진행 중인 방이 없으면 힌트만 바뀐다 (시안 803:8821~8831) */
export function toHubActions(rooms: MyRoom[]): HubAction[] {
  const live = rooms.filter((room) => room.status === "live");
  const ended = rooms.filter((room) => room.status === "ended");
  const firstLive = live[0];
  const livePin = firstLive?.pin;

  return [
    { label: "새 방 만들기", href: "/host/rooms/new", primary: true },
    {
      label: "진행 중인 방 열기",
      hint:
        live.length === 0
          ? "진행 중인 방이 없어요"
          : [`${live.length}개`, livePin === undefined ? null : `PIN ${formatPin(livePin)}`]
              .filter((part): part is string => part !== null)
              .join(" · "),
      href: firstLive === undefined ? "/host/rooms/new" : `/host/rooms/${firstLive.code}/live`,
    },
    {
      label: "종료된 방 리포트",
      hint: `${ended.length}개`,
      href:
        ended[0] === undefined
          ? "/host/rooms"
          : `/host/sessions/${ended[0].reportId ?? ended[0].code}/review`,
    },
  ];
}
