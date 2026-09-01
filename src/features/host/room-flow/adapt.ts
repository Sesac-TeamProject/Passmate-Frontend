import { LEVEL_TITLE } from "@/lib/host-level";
import type { HostLevel } from "@/lib/types/dto/common";
import { AppError } from "@/lib/types/app-error";
import type { CreateRoomRequest, QuestionSetDto } from "@/lib/types/dto";
import { ERROR_CODES } from "@/lib/types/error-codes";
import type { NewRoomInitialValues } from "./new-room-form";

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

/**
 * 폼 안에서 한 줄로 알려야 하는 실패인가.
 * 04 보드 A 규칙 — 입력 오류는 화면을 갈아 끼우지 않고 필드 아래 한 줄로 알린다.
 * 여기 해당하지 않는 실패(서버·네트워크)만 W-02e 전체 화면으로 보낸다.
 */
export function isFormLevelCreateError(error: unknown): boolean {
  if (!AppError.isAppError(error)) return false;
  return (
    error.kind === "ValidationFailed" ||
    error.code === ERROR_CODES.HOST_LEVEL_REQUIRED ||
    error.code === ERROR_CODES.INSUFFICIENT_COINS
  );
}

/** 방 설정 한 줄 요약 (W-02e "입력한 설정은 그대로 남아 있어요" 아래 줄) */
export function toRoomSummary(body: CreateRoomRequest, sets: QuestionSetOption[]): string {
  const set = sets.find((s) => s.id === String(body.questionSetId));
  const parts = [
    body.title,
    set ? `${set.title} ${set.questionCount}문항` : null,
    body.isPaid ? "유료" : "무료",
  ];
  return parts.filter(Boolean).join(" · ");
}

/** 보낸 값 → 폼 초기값. W-02e에서 "설정으로 돌아가기"로 돌아올 때 입력을 되살린다 */
export function toNewRoomInitialValues(body: CreateRoomRequest): NewRoomInitialValues {
  return {
    title: body.title,
    setId: body.questionSetId != null ? String(body.questionSetId) : "",
    roomType: body.isPaid ? "paid" : "free",
    fee: body.entryFee ?? DEFAULT_ENTRY_FEE,
  };
}

/** POST /rooms 실패 문구. 서버 code로 분기하고, 검증 실패만 서버 메시지를 그대로 보여준다 */
export function toCreateRoomErrorMessage(error: unknown): string {
  if (!AppError.isAppError(error)) return "방을 만들지 못했어요. 잠시 후 다시 시도해 주세요.";
  if (error.code === ERROR_CODES.HOST_LEVEL_REQUIRED)
    return `유료 방은 Lv.${PAID_ROOM_MIN_LEVEL}부터 열 수 있어요`;
  if (error.kind === "ValidationFailed") return error.serverMessage ?? error.message;
  return error.message;
}
