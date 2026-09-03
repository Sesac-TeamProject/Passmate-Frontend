import type { BadgeResponse, BadgeType, GradeResponse } from "@/lib/types/dto";
import type { LevelCriterion } from "./next-level-card";

/**
 * 승급 조건의 단위 — 계약에 단위 필드가 없어 조건 종류로 가른다.
 * 사람을 세는 것만 "명", 나머지는 "회" (시안 813:8873·8877).
 */
function unitOf(type: string): string {
  return type === "TOTAL_STUDENTS" ? "명" : "회";
}

/**
 * GET /users/me/grade → W-14 승급 조건 바.
 * 서버가 조건과 진행도를 계산해 주므로 화면은 옮겨 그리기만 한다.
 * 유지 조건(별점·월 활동)은 채우는 값이 아니라 지키는 값이라 여기 넣지 않는다 — `maintenance`가 따로 온다.
 */
export function toLevelCriteria(grade: GradeResponse | undefined): LevelCriterion[] {
  return (grade?.nextRequirements ?? []).map((requirement) => ({
    label: requirement.label,
    current: requirement.current,
    target: requirement.target,
    unit: unitOf(requirement.type),
  }));
}

/** "2026-08-10 Lv.3 달성 · 한 번 달성하면 내려가지 않아요" — 달성일이 없으면 규칙만 적는다 */
export function toAchievedLabel(grade: GradeResponse | undefined): string {
  const level = grade?.level ?? 1;
  const rule = level <= 3 ? "한 번 달성하면 내려가지 않아요" : "30일마다 유지 조건을 확인해요";
  const achievedAt = grade?.levelAchievedAt;

  // 서버 시각은 오프셋 없는 UTC라 날짜만 떼어 쓴다 (시분은 화면에 쓰지 않는다)
  return achievedAt ? `${achievedAt.slice(0, 10)} Lv.${level} 달성 · ${rule}` : rule;
}

/** 다음 레벨 칭호 — 서버가 준 이름을 그대로 쓴다. 최고 등급이면 빈 문자열 */
export function toNextTitle(grade: GradeResponse | undefined): string {
  return grade?.nextLevelName ?? "";
}

/**
 * GET /users/me/badges → 획득한 뱃지 코드 집합.
 * 서버는 못 딴 것도 함께 주므로(`achieved: false`) 여기서 걸러 낸다.
 */
export function toEarnedBadges(badges: BadgeResponse[] | undefined): Set<BadgeType> {
  return new Set((badges ?? []).filter((badge) => badge.achieved).map((badge) => badge.code));
}
