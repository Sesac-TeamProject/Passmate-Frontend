import type { StatItem } from "@/components/common/stat-cards";
import { parseServerDateTime } from "@/lib/datetime";
import { LEVEL_TITLE, levelTitle } from "@/lib/host-level";
import type { HostedRoomsResponse, HostReputation } from "@/lib/types/dto";
import { type LevelStatus, type MyRoom, type Promotion, type PromotionRule } from "./types";

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

const PROMOTION_NOTE = "승급 조건은 서버가 아직 판정하지 않아요. 지금까지의 실적만 보여드립니다.";

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
 * 명성 요약 → 다음 레벨 승급 조건 카드.
 *
 * 승급 조건(몇 회·몇 명)은 **서버가 주지 않는다** — 등급 판정 자체가 아직 없다.
 * 대신 지금까지의 실적(진행 세션·누적 학생·별점)을 그대로 보여 준다: 지어낸 목표선을 그리지 않는다.
 */
export function toPromotion(reputation: HostReputation): Promotion | null {
  if (reputation.level === undefined) return null;

  const rules: PromotionRule[] = [
    { label: "진행한 세션", value: `${reputation.hostedSessionCount}회`, met: false },
    { label: "누적 학생", value: `${reputation.totalStudentCount}명`, met: false },
    ...(reputation.averageStars !== undefined
      ? [
          {
            label: "평균 별점",
            value: `${reputation.averageStars.toFixed(1)} (${reputation.ratingCount}개)`,
            met: false,
          },
        ]
      : []),
  ];

  return { targetLevel: Math.min(5, reputation.level + 1), rules, note: PROMOTION_NOTE };
}

/**
 * W-09 상단 통계 3장.
 * 누적 학생 수는 **명성 요약**에서 온다 — 등급 API(`/users/me/grade`)는 백엔드에 없다.
 */
export function toMyRoomStats(rooms: MyRoom[], reputation: HostReputation): StatItem[] {
  const liveCount = rooms.filter((r) => r.status === "live").length;
  const endedCount = rooms.filter((r) => r.status === "ended").length;
  const totalStudents = reputation.totalStudentCount;

  return [
    {
      id: "live",
      label: "진행 중인 방",
      value: `${liveCount}개`,
      tile: { label: "R", tone: "mint" },
    },
    {
      id: "ended",
      label: "종료된 방",
      value: `${endedCount}개`,
      tile: { label: "E", tone: "blue" },
    },
    {
      id: "students",
      label: "누적 학생 수",
      value: `${totalStudents}명`,
      tile: { label: "U", tone: "orange" },
    },
  ];
}
