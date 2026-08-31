import { LEVEL_TITLE } from "@/lib/host-level";
import type { HostLevel } from "@/lib/types/dto/common";
import { AppError } from "@/lib/types/app-error";
import type { QuestionSetDto } from "@/lib/types/dto";
import { ERROR_CODES } from "@/lib/types/error-codes";

/** 방 설정 폼의 문제 세트 선택 항목 — 목록에 필요한 최소 필드만 */
export type QuestionSetOption = { id: string; title: string; questionCount: number };

/** 유료 방 개설에 필요한 최소 명성 레벨 (FR-021) */
export const PAID_ROOM_MIN_LEVEL = 3;

/** 참가비 기본값(원, 1인당). 서버 설정 API가 없어 화면 기본값으로 둔다 */
export const DEFAULT_ENTRY_FEE = 10000;

/** 선생님 정산 비율 (0~1). 비율은 확정 전 예시 (§13.5) */
export const HOST_SHARE = 0.8;

/**
 * 새 방 폼의 명성 레벨 미리보기 — 값이 없거나 범위를 벗어나도 항상 칭호를 보여줘야 해서
 * (반올림 후 1~5로 클램프) `@/lib/host-level`의 단순 조회와는 다른 이 화면만의 폴백을 쓴다.
 */
export function levelTitle(level: number): string {
  const lv = Math.min(5, Math.max(1, Math.round(level))) as HostLevel;
  return LEVEL_TITLE[lv];
}

/** GET /question-sets(status=CONFIRMED) → 세트 선택 옵션. setId가 없는 항목은 고를 수 없으므로 버린다 */
export function toQuestionSetOptions(sets: QuestionSetDto[]): QuestionSetOption[] {
  return sets
    .filter((s): s is QuestionSetDto & { setId: number } => typeof s.setId === "number")
    .map((s) => ({
      id: String(s.setId),
      title: s.title ?? "제목 없는 세트",
      questionCount: s.questionCount ?? 0,
    }));
}

/** POST /rooms 실패 문구. 서버 code로 분기하고, 검증 실패만 서버 메시지를 그대로 보여준다 */
export function toCreateRoomErrorMessage(error: unknown): string {
  if (!AppError.isAppError(error)) return "방을 만들지 못했어요. 잠시 후 다시 시도해 주세요.";
  if (error.code === ERROR_CODES.HOST_LEVEL_REQUIRED)
    return `유료 방은 Lv.${PAID_ROOM_MIN_LEVEL}부터 열 수 있어요`;
  if (error.kind === "ValidationFailed") return error.serverMessage ?? error.message;
  return error.message;
}
