import type { QuestionSet } from "@/features/host/types";
import { parseServerDateTime } from "@/lib/datetime";
import type { QuestionSetSummaryResponse } from "@/lib/types/dto";

/** 서버 시각(UTC naive) → "8/22". 값이 없거나 깨졌으면 빈 문자열 */
function toShortDate(value: string | undefined): string {
  if (!value) return "";
  const date = parseServerDateTime(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * GET /question-sets 항목 → 문제 세트 카드.
 *
 * 요약에는 문항 본문이 없어 `composition`·`preview`는 비운다 — 카드가 그 둘을 그리지 않는다.
 * `minutes`는 서버 `estimatedSeconds`(문항 제한시간 합)에서 올림해 만든다.
 */
export function toQuestionSets(items: QuestionSetSummaryResponse[]): QuestionSet[] {
  return items.map((s) => ({
    id: String(s.id),
    title: s.title,
    summary: "",
    questionCount: s.questionCount,
    tile: { label: s.title.slice(0, 1), tone: "mint" },
    composition: [],
    totalPoints: s.totalPoints,
    minutes: s.estimatedSeconds ? Math.ceil(s.estimatedSeconds / 60) : 0,
    usage:
      s.usageCount > 0 ? { count: s.usageCount, lastUsed: toShortDate(s.lastUsedAt) } : undefined,
    preview: [],
    isConfirmed: s.status === "CONFIRMED",
  }));
}
