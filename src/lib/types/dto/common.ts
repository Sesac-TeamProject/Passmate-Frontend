/** 오류 응답 본문 (계약 §공통 오류 형식). KMP는 둘 다 생략 가능으로 파싱한다. */
export type ApiErrorBody = { code?: string | null; message?: string | null };

/** 커서 페이지네이션 공통 응답 (`?cursor=` 요청) */
export type CursorPage<T> = { items?: T[]; nextCursor?: string | null; hasNext?: boolean };

export type RoomState = "WAITING" | "RUNNING" | "FINISHED" | "ENDED";
export type QuestionType = "MULTIPLE_CHOICE" | "OX" | "ESSAY";
/** 호스트 등급 1~5 (새싹·성장·검증된 운영자·인기 운영자·마스터). 숫자로 전송 */
export type HostLevel = 1 | 2 | 3 | 4 | 5;
export type PaymentMethod = "KAKAO_PAY" | "NAVER_PAY" | "TOSS_PAY" | "CARD" | "TRANSFER";

/**
 * 아바타 키 12종. ERD `user.default_avatar_id varchar(30)` · `participant.avatar_id varchar(30)` —
 * 서버가 문자열로 주고받으므로 숫자 id로 변환하지 않는다.
 * 이미지는 public/avatars/<key>.png, 원본은 design/design.pen "학생 아바타 — Avatar 세트".
 */
export const AVATAR_KEYS = [
  "cat",
  "dog",
  "bear",
  "panda",
  "rabbit",
  "fox",
  "frog",
  "penguin",
  "owl",
  "tiger",
  "raccoon",
  "dino",
] as const;

export type AvatarKey = (typeof AVATAR_KEYS)[number];

/** 서버가 준 값이 아는 키가 아니면 "cat"으로 안전하게 접는다 */
export function toAvatarKey(value: string | null | undefined): AvatarKey {
  return AVATAR_KEYS.includes(value as AvatarKey) ? (value as AvatarKey) : "cat";
}
