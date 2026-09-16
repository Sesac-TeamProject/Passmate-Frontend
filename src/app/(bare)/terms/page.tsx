import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { LegalBackBar } from "@/features/legal/legal-back-bar";
import { LegalDocumentView } from "@/features/legal/legal-document-view";
import { LEGAL_DOCUMENTS, LEGAL_TABS } from "@/features/legal/legal-documents";

const doc = LEGAL_DOCUMENTS.terms;

export const metadata: Metadata = {
  title: `${doc.title} | PassMate`,
};

/**
 * C-04 서비스 이용약관 (웹) · M-12-13 (앱) — 정적 문서라 상태가 없다. 랜딩처럼 서버 컴포넌트로 둔다.
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
