/**
 * 빌드 시점에 인라인되는 공개 환경값.
 * NEXT_PUBLIC_API_BASE_URL이 비어 있으면 백엔드 없이 목 응답으로 동작한다 (lib/mocks).
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export const IS_MOCK = API_BASE_URL === "";
