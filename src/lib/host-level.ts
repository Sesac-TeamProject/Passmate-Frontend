import type { HostLevel } from "@/lib/types/dto/common";

/** 호스트 등급(Lv.1~5) → 칭호. 계약 dto/common.ts HostLevel 주석과 동일 */
export const LEVEL_TITLE: Record<HostLevel, string> = {
  1: "새싹",
  2: "성장",
  3: "검증된 운영자",
  4: "인기 운영자",
  5: "마스터",
};

/** 레벨 → 칭호. 값이 없거나 범위를 벗어나면 가장 가까운 등급(기본 Lv.1)으로 접는다 */
export function levelTitle(level: number | null | undefined): string {
  if (level == null || Number.isNaN(level)) return LEVEL_TITLE[1];
  const lv = Math.min(5, Math.max(1, Math.round(level))) as HostLevel;
  return LEVEL_TITLE[lv];
}
