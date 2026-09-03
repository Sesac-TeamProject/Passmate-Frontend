import { formatPin, formatWon } from "@/lib/format";
import { LEVEL_TITLE, levelTitle } from "@/lib/host-level";
import type { GradeResponse, HostedRoomDto } from "@/lib/types/dto";
import type { HubAction } from "./hub-actions";
import type { HubStat } from "./hub-summary";
import { type LevelStatus, type MyRoom, type Promotion, type PromotionRule } from "./types";

/** GET /users/me/rooms/hosted 항목 → 방 목록 카드 */
export function toMyRooms(items: HostedRoomDto[]): MyRoom[] {
  return items.map((r) => ({
    code: r.pin ?? "",
    title: r.title ?? "",
    status: r.status === "FINISHED" || r.status === "ENDED" ? "ended" : "live",
    students: r.participantCount ?? 0,
    pin: r.pin ?? undefined,
    startsLabel: r.scheduledAt ?? undefined,
    endedLabel: r.endedAtLabel ?? undefined,
    averageScore: r.avgAccuracyPercent ?? undefined,
    reportId: String(r.roomId ?? ""),
  }));
}

/** 레벨 카드 혜택 칩 — 필요 레벨 이상이면 획득 처리 (labels: mock.ts LEVEL_STATUS.perks 원문 유지) */
const LEVEL_PERK_DEFS: { label: string; requiredLevel: number }[] = [
  { label: "유료 방 개설 (Lv.3)", requiredLevel: 3 },
  { label: "프로필 뱃지 표시", requiredLevel: 1 },
  { label: "방 목록 상단 노출 (Lv.4)", requiredLevel: 4 },
  { label: "브랜디드 퀴즈 제안 (Lv.5)", requiredLevel: 5 },
];

/** GET /users/me/grade → 현재 레벨 카드 */
export function toLevelStatus(grade: GradeResponse | undefined): LevelStatus {
  const level = grade?.level ?? 1;
  const nextLevel = grade?.next?.level ?? Math.min(5, level + 1);
  const tail = level <= 3 ? "하락 없음 (영구)" : "30일 유지 판정";

  return {
    level,
    title: levelTitle(level) ?? LEVEL_TITLE[1],
    achievedLabel: grade?.achievedAt ? `${grade.achievedAt} 달성 · ${tail}` : tail,
    next: {
      level: nextLevel,
      title: levelTitle(nextLevel) ?? "",
      progress: grade?.next?.progressPercent ?? 0,
    },
    perks: LEVEL_PERK_DEFS.map((p) => ({ label: p.label, earned: level >= p.requiredLevel })),
  };
}

const PROMOTION_NOTE =
  "하락 규칙 — Lv.4·5는 최근 30일 활동(4회·5회) 또는 평균 별점 4.0이 유지 조건 아래로 내려가면 한 단계 하락. Lv.3까지는 한 번 달성하면 하락 없음.";

/** GET /users/me/grade → 다음 레벨 승급 조건 카드 */
export function toPromotion(grade: GradeResponse | undefined): Promotion {
  const next = grade?.next;
  const targetLevel = next?.level ?? Math.min(5, (grade?.level ?? 1) + 1);
  const rules: PromotionRule[] = (next?.criteria ?? []).map((c) => ({
    label: c.label ?? "",
    value: `${c.current ?? 0} / ${c.target ?? 0}`,
    met: c.met ?? false,
  }));

  return { targetLevel, rules, note: PROMOTION_NOTE };
}

/** 명성 카드 부제 "방 운영 24회 · 평균 평가 4.6" — 없는 조각은 뺀다 */
export function toLevelSubtitle(grade: GradeResponse | undefined): string {
  const roomCount = grade?.stats?.roomCount;
  const avgStars = grade?.stats?.avgStars;

  return [
    roomCount === undefined ? null : `방 운영 ${roomCount}회`,
    avgStars === null || avgStars === undefined ? null : `평균 평가 ${avgStars}`,
  ]
    .filter((part): part is string => part !== null)
    .join(" · ");
}

/** W-09 가운데 운영 실적 3줄 — 방 운영 횟수 · 평균 평가 · 이번 달 정산 예정 (시안 803:8803~8814) */
export function toHubStats(
  grade: GradeResponse | undefined,
  monthlyTotal: number | undefined,
): HubStat[] {
  const avgStars = grade?.stats?.avgStars;

  return [
    {
      id: "rooms",
      icon: "▦",
      value: `${grade?.stats?.roomCount ?? 0}회`,
      description: "지금까지 방을 연 횟수예요",
    },
    {
      id: "stars",
      icon: "★",
      value: avgStars === null || avgStars === undefined ? "—" : `${avgStars} / 5`,
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
