import type { StatItem } from "@/components/common/stat-cards";
import type { GradeResponse, HostedRoomDto } from "@/lib/types/dto";
import {
  LEVEL_TITLE,
  type LevelStatus,
  type MyRoom,
  type Promotion,
  type PromotionRule,
} from "./types";

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
    title: LEVEL_TITLE[level] ?? LEVEL_TITLE[1],
    achievedLabel: grade?.achievedAt ? `${grade.achievedAt} 달성 · ${tail}` : tail,
    next: {
      level: nextLevel,
      title: LEVEL_TITLE[nextLevel] ?? "",
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

/** W-09 상단 통계 3장 — 진행 중·종료 방 수는 조회된 목록에서, 누적 학생 수는 등급 통계에서 뽑는다 */
export function toMyRoomStats(rooms: MyRoom[], grade: GradeResponse | undefined): StatItem[] {
  const liveCount = rooms.filter((r) => r.status === "live").length;
  const endedCount = rooms.filter((r) => r.status === "ended").length;
  const totalStudents = grade?.stats?.totalStudents ?? 0;

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
