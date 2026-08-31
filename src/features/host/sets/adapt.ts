import type { QuestionSet } from "@/features/host/types";
import type { QuestionSetDto } from "@/lib/types/dto";

/**
 * GET /question-sets 항목 → 문제 세트 카드. 계약에 없는 composition·totalPoints·minutes·preview는
 * 지금은 빈 값으로 둔다(상세 @draft 연동 전까지 카드에는 보이지 않는다).
 */
export function toQuestionSets(items: QuestionSetDto[]): QuestionSet[] {
  return items.map((s) => ({
    id: String(s.setId),
    title: s.title ?? "",
    summary: "",
    questionCount: s.questionCount ?? 0,
    tile: { label: (s.title ?? "").slice(0, 1), tone: "mint" },
    composition: [],
    totalPoints: 0,
    minutes: 0,
    usage: s.usedCount ? { count: s.usedCount, lastUsed: s.lastUsedAt ?? "" } : undefined,
    preview: [],
    isConfirmed: (s.status ?? "").toUpperCase() === "CONFIRMED",
  }));
}
