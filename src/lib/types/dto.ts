/**
 * REST 계약과 1:1인 DTO. 도메인별 파일은 `./dto/*`, 여기는 re-export 허브다.
 * 계약 원천: KMP `shared` DTO(2026-08-28 백엔드 명세 정합) — `@draft` 표시는 계약이 아직 없는 초안.
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
