import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { LegalBackBar } from "@/features/legal/legal-back-bar";
import { LegalDocumentView } from "@/features/legal/legal-document-view";
import { LEGAL_DOCUMENTS, LEGAL_TABS } from "@/features/legal/legal-documents";

const doc = LEGAL_DOCUMENTS.privacy;

export const metadata: Metadata = {
  title: `${doc.title} | PassMate`,
};

/**
 * C-05 개인정보 처리방침 (웹) · M-12-14 (앱) — 정적 문서라 상태가 없다. 랜딩처럼 서버 컴포넌트로 둔다.
 * Google OAuth 동의 화면(브랜딩)에 https://passmate.kr/privacy 로 거는 주소다 — 경로를 바꾸면 콘솔도 고친다.
 * 폰 폭은 시안대로 공용 헤더 없이 "← 제목" 줄만 서서, 헤더를 거는 (public) 그룹이 아니라 여기 둔다.
 */
export default function Page() {
  return (
    <>
      <SiteHeader className="max-md:hidden" />
      <LegalDocumentView
        document={doc}
        tabs={LEGAL_TABS}
        mobileTopBar={<LegalBackBar title={doc.title} />}
      />
    </>
  );
}
