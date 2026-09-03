import { levelTitle } from "@/lib/host-level";
import type { BadgeDto, BadgeType, GradeResponse } from "@/lib/types/dto";
import type { LevelCriterion } from "./next-level-card";

/**
 * 승급 조건의 단위 — 계약에 단위 필드가 없어 라벨로 가른다.
 * "누적 학생"처럼 사람을 세는 것만 "명", 나머지는 "회" (시안 813:8873·8877).
 */
function unitOf(label: string): string {
  return label.includes("학생") ? "명" : "회";
}

/**
 * GET /users/me/grade → W-14 승급 조건 바.
 * 시안은 "올라가기 위해 채워야 하는 것"만 바로 그린다 — 유지 조건(별점·월 활동)은
 * 채우는 값이 아니라 지키는 값이라 카드 아래 문구 한 줄로 따로 적는다 (시안 813:8880).
 */
export function toLevelCriteria(grade: GradeResponse | undefined): LevelCriterion[] {
  return (grade?.next?.criteria ?? [])
    .filter((criterion) => !(criterion.label ?? "").includes("유지 조건"))
    .map((criterion) => {
      const label = criterion.label ?? "";

      return {
        label,
        current: criterion.current ?? 0,
        target: criterion.target ?? 0,
        unit: unitOf(label),
      };
    });
}

/** "2026-08-10 Lv.3 달성 · 한 번 달성하면 내려가지 않아요" — 달성일이 없으면 규칙만 적는다 */
export function toAchievedLabel(grade: GradeResponse | undefined): string {
  const level = grade?.level ?? 1;
  const rule = level <= 3 ? "한 번 달성하면 내려가지 않아요" : "30일마다 유지 조건을 확인해요";
  const achievedAt = grade?.achievedAt;

  return achievedAt ? `${achievedAt} Lv.${level} 달성 · ${rule}` : rule;
}

/** 다음 레벨 칭호. 계약에 없으면 빈 문자열 — 화면이 "Lv.4까지"로만 적는다 */
export function toNextTitle(grade: GradeResponse | undefined): string {
  return levelTitle(grade?.next?.level) ?? "";
}

/** GET /users/me/badges → 획득한 뱃지 종류 집합 */
export function toEarnedBadges(items: BadgeDto[] | undefined): Set<BadgeType> {
  const earned = (items ?? [])
    .filter((badge) => badge.earned === true && badge.type !== undefined)
    .map((badge) => badge.type as BadgeType);

  return new Set(earned);
}
