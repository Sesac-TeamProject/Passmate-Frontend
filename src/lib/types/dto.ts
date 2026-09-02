/**
 * REST 계약과 1:1인 DTO. 도메인별 파일은 `./dto/*`, 여기는 re-export 허브다.
 *
 * **계약 원천은 백엔드 코드다** — `Sesac-TeamProject/Passmate-Backend@develop`의 컨트롤러·DTO를
 * 그대로 옮겼다(대조표: `specs/001-passmate-mvp/contracts/rest-api.md`).
 * `@draft` 표시는 백엔드에 아직 구현이 없어(실서버 404) 목에서만 도는 부분이다 —
 * 코인·정산·관리자·평가 제출·기록 이관·음성 힌트·세트 복제·파일 생성.
 */
export * from "./dto/common";
export * from "./dto/auth";
export * from "./dto/rooms";
export * from "./dto/session";
export * from "./dto/question-sets";
export * from "./dto/results";
export * from "./dto/me";
export * from "./dto/payments";
export * from "./dto/ratings";
export * from "./dto/admin";
