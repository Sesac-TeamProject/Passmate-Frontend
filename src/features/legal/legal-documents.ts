import { PRIVACY_POLICY } from "./privacy-policy";
import { TERMS_OF_SERVICE } from "./terms-of-service";

/** 법적 고지 문서 전부. 페이지·링크·테스트가 경로를 여기서 읽는다 */
export const LEGAL_DOCUMENTS = {
  terms: TERMS_OF_SERVICE,
  privacy: PRIVACY_POLICY,
} as const;

/** 웹 상단 탭 순서 (시안 C-04 · C-05: 이용약관 → 개인정보 처리방침) */
export const LEGAL_TABS = [TERMS_OF_SERVICE, PRIVACY_POLICY] as const;
