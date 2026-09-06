import { VIEW_TYPE } from "@/features/host/editor/adapt";
import type { QuestionSet, QuestionType } from "@/features/host/types";
import { parseServerDateTime } from "@/lib/datetime";
import { AppError } from "@/lib/types/app-error";
import type { QuestionSetDetailResponse, QuestionSetSummaryResponse } from "@/lib/types/dto";

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
    // 목록 응답에는 유형별 개수가 없다 — 카드가 이 줄을 통째로 감춘다
    summary: undefined,
    questionCount: s.questionCount,
    tile: { label: s.title.slice(0, 1), tone: "mint" },
    composition: [],
    totalPoints: s.totalPoints,
    minutes: s.estimatedSeconds ? Math.ceil(s.estimatedSeconds / 60) : null,
    usage:
      s.usageCount > 0 ? { count: s.usageCount, lastUsed: toShortDate(s.lastUsedAt) } : undefined,
    preview: [],
    isConfirmed: s.status === "CONFIRMED",
  }));
}

/** 우측 패널 미리보기에 보여 줄 문항 수 — 시안은 3줄 뒤에 "··· N문항 더". 스켈레톤도 이 수를 쓴다 */
export const PREVIEW_COUNT = 3;

/** 칩 순서는 시안 고정이다(객관식 → 서술형 → OX) — 없는 유형은 빼고 그린다 */
const COMPOSITION_ORDER: QuestionType[] = ["multiple", "essay", "ox"];

/**
 * GET /question-sets/{id} → 우측 패널의 유형 칩 · 문항 미리보기.
 *
 * 목록 응답(`GET /question-sets`)에는 문항 본문도 유형별 개수도 없다 — 그래서 목록만 읽던
 * 예전 화면은 세트를 골라도 미리보기가 늘 비었다. 고른 세트만 상세를 따로 읽어 채운다.
 */
export function toSetDetail(detail: QuestionSetDetailResponse): {
  composition: QuestionSet["composition"];
  preview: string[];
} {
  const counts = new Map<QuestionType, number>();
  for (const q of detail.questions) {
    const type = VIEW_TYPE[q.type];
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }

  return {
    composition: COMPOSITION_ORDER.filter((type) => counts.has(type)).map((type) => ({
      type,
      count: counts.get(type) as number,
    })),
    // 서버가 순서를 보장하지만(orderNo) 응답 순서에 기대지 않고 한 번 더 정렬한다
    preview: [...detail.questions]
      .sort((a, b) => a.orderNo - b.orderNo)
      .slice(0, PREVIEW_COUNT)
      .map((q) => q.content),
  };
}

/** 세트 삭제 실패 문구 */
export function toDeleteErrorMessage(error: unknown): string {
  if (!AppError.isAppError(error)) return "삭제하지 못했어요. 다시 시도해 주세요";
  // 아직 끝나지 않은 방이 이 세트를 쓰고 있으면 서버가 409로 막는다.
  // 공통 Conflict 문구("이미 처리된 요청이에요")는 여기서 사실과 달라 이유를 따로 적는다.
  if (error.kind === "Conflict") {
    return "아직 끝나지 않은 방이 쓰고 있어요. 그 방을 먼저 정리해 주세요";
  }
  if (error.kind === "NotFound") return "이미 지워진 세트예요. 목록을 새로 고쳐 주세요";
  return error.message;
}

/** 세트 복제 실패 문구 */
export function toCloneErrorMessage(error: unknown): string {
  if (!AppError.isAppError(error)) return "복제하지 못했어요. 다시 시도해 주세요";
  // 원본 세트가 지워졌거나 남의 세트인 경우
  if (error.kind === "NotFound") return "이 세트를 찾을 수 없어요. 목록을 새로 고쳐 주세요";
  return error.message;
}
