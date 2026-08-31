/** 오류 응답 본문 (계약 §공통 오류 형식). KMP는 둘 다 생략 가능으로 파싱한다. */
export type ApiErrorBody = { code?: string | null; message?: string | null };

/** 커서 페이지네이션 공통 응답 (`?cursor=` 요청) */
export type CursorPage<T> = { items?: T[]; nextCursor?: string | null; hasNext?: boolean };

export type RoomState = "WAITING" | "RUNNING" | "FINISHED" | "ENDED";
export type QuestionType = "MULTIPLE_CHOICE" | "OX" | "ESSAY";
/** 호스트 등급 1~5 (새싹·성장·검증된 운영자·인기 운영자·마스터). 숫자로 전송 */
export type HostLevel = 1 | 2 | 3 | 4 | 5;
export type PaymentMethod = "KAKAO_PAY" | "NAVER_PAY" | "TOSS_PAY" | "CARD" | "TRANSFER";
