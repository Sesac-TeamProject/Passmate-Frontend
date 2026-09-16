/**
 * 이용약관·개인정보 처리방침 같은 법적 고지 문서의 모양 (시안 C-04·C-05 웹 / M-12-13·M-12-14 앱).
 *
 * 시안은 조항마다 "제목 한 줄 + 본문 한 문단"이다. 문구는 데이터로 두고 화면(`LegalDocumentView`) 하나가
 * 두 문서를 같이 그린다 — 조항을 고칠 때 JSX를 건드리지 않고, 두 문서의 생김새가 따로 놀지 않게 하려는 것이다.
 */
export type LegalSection = {
  /** 번호까지 포함한 제목. 예: "제1조 (목적)" · "1. 수집하는 개인정보" */
  heading: string;
  body: string;
};

export type LegalDocument = {
  /** 이 문서가 뜨는 주소. routes.ts에 공개 라우트로 등록돼 있어야 한다 */
  path: string;
  /** 문서 제목. 예: "서비스 이용약관" */
  title: string;
  /** 웹 상단 탭 이름. 예: "이용약관" */
  tabLabel: string;
  /** 시행일 YYYY-MM-DD */
  effectiveDate: string;
  version: string;
  sections: readonly LegalSection[];
};
