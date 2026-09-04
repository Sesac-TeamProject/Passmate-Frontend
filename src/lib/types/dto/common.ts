/**
 * 도메인 공통 타입. 필드명·enum 문자열은 **백엔드 코드가 정답**이다
 * (`specs/001-passmate-mvp/contracts/rest-api.md` §2-1, `data-model.md` §1).
 *
 * 작성 규약 두 가지:
 * 1. **nullable은 `field?: T`** — 서버가 `spring.jackson.default-property-inclusion: non_null`이라
 *    null인 필드는 JSON에서 아예 빠진다. `T | null`·`?? null` 정규화를 쓰지 않는다.
 * 2. **이름을 번역하지 않는다** — 어댑터(`features/<role>/…/adapt.ts`)가 화면용 파생값만 만든다.
 */

/**
 * 오류 응답 본문 (`{code, message}`). 서버는 항상 둘 다 주지만 파싱은 느슨하게 받는다.
 * `data`는 **다음 행동에 필요할 때만** 붙는다 — 지금은 402 `INSUFFICIENT_COINS`의 부족분뿐이다.
 */
export type ApiErrorBody = { code?: string | null; message?: string | null; data?: unknown };

/**
 * 목록 응답 공통 형식 — **오프셋 페이지**(`?page=0&size=20`).
 * 백엔드 `common/dto/PageResponse.kt` 1:1. 무한 스크롤은 `hasNext` + `page + 1`로 만든다.
 */
export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};

/**
 * @draft 커서 페이지네이션 — 구현된 도메인에는 없다.
 * 스웨거 대기 구역(코인 내역·정산 내역)의 목 응답만 이 형태를 쓴다.
 */
export type CursorPage<T> = { items?: T[]; nextCursor?: string | null; hasNext?: boolean };

/** 방 상태 — 백엔드 `room/domain/RoomStatus.kt`. `FINISHED`는 서버에 없다(세션 phase는 스토어 파생값) */
export type RoomStatus = "WAITING" | "RUNNING" | "ENDED" | "CANCELED";
/** 방 유형 — `POST /rooms`는 FREE·PAID를 받는다(BRANDED만 400 UNSUPPORTED_ROOM_TYPE) */
export type RoomType = "FREE" | "PAID" | "BRANDED";

/** 문항 유형 — 백엔드 `question/domain/QuestionEnums.kt`. 객관식은 `MCQ`다 */
export type QuestionType = "MCQ" | "OX" | "ESSAY";
/** 난이도 — ERD의 `MEDIUM`이 아니라 `NORMAL`이 정답(코드 기준) */
export type Difficulty = "EASY" | "NORMAL" | "HARD";
/** 문제 세트 상태 — CONFIRMED 후 불변 */
export type QuestionSetStatus = "DRAFT" | "CONFIRMED";
/** 문항 출처 */
export type QuestionSource = "AI" | "MANUAL";
/** 세트 출처 — 문항 출처가 섞이면 MIXED */
export type ContentSource = "AI" | "MANUAL" | "MIXED";

/** 서술형 AI 분석 상태 — 백엔드 `feedback/dto/FeedbackResponses.kt` */
export type AnalysisStatus = "NOT_REQUESTED" | "PENDING" | "DONE" | "FAILED";

/** 로그인 방식 — 현재 GOOGLE 하나 */
export type AuthProvider = "GOOGLE";

/**
 * 호스트 등급 1~5 (새싹·성장·검증된 운영자·인기 운영자·마스터).
 *
 * `GET /users/me/grade`가 실제 값을 계산해 준다(승급 조건별 진행도까지). 다만 방 목록·공개
 * 프로필의 요약(`HostReputation.level`)은 비어 올 수 있다 — **없으면 Lv.1로 채우지 말고 감춘다.**
 */
export type HostLevel = 1 | 2 | 3 | 4 | 5;
/**
 * 코인 충전에 쓸 결제 수단 — 백엔드 `coin/domain/PaymentMethod.kt`.
 * **언더스코어가 없다**(`KAKAO_PAY`가 아니라 `KAKAOPAY`) — 옛 값으로 보내면 400이다.
 * 카드 정보는 서버에 저장되지 않는다(포트원이 갖는다).
 */
export type PaymentMethod = "KAKAOPAY" | "NAVERPAY" | "TOSSPAY" | "CARD" | "BANK_TRANSFER";

/**
 * 아바타 키 12종. ERD `user.default_avatar_id varchar(30)` · `participant.avatar_id varchar(30)` —
 * 서버가 문자열로 주고받으므로 숫자 id로 변환하지 않는다.
 * 이미지는 public/avatars/<key>.png, 원본은 design/design.pen "학생 아바타 — Avatar 세트".
 *
 * 주의: 회원에게 기본 캐릭터가 없으면 백엔드가 `"default"`를 넣는다(`ParticipantService`) —
 * 12종에 없는 값이라 `toAvatarKey()`가 "cat"으로 접는다(백엔드 질문 B-5).
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
