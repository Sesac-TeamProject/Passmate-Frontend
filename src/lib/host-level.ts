import type { HostLevel } from "@/lib/types/dto/common";

/** 호스트 등급(Lv.1~5) → 칭호. 계약 dto/common.ts HostLevel 주석과 동일 */
export const LEVEL_TITLE: Record<HostLevel, string> = {
  1: "새싹",
  2: "성장",
  3: "검증된 운영자",
  4: "인기 운영자",
  5: "마스터",
};

/**
 * 레벨 → 칭호. 1~5의 정확한 키가 아니면(범위 밖·값 없음) undefined를 돌려준다 — 폴백은
 * 호출부가 정한다(예: `levelTitle(level) ?? LEVEL_TITLE[1]`, 빈 문자열, 반올림·클램프 등
 * 화면마다 다를 수 있어 헬퍼에 기본값을 박아 두지 않는다).
 */
export function levelTitle(level: number | null | undefined): string | undefined {
  if (level == null) return undefined;
  return LEVEL_TITLE[level as HostLevel];
}
