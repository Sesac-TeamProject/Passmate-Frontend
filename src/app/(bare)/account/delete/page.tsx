import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { ACCOUNT_DELETION } from "@/features/legal/account-deletion";
import { AccountDeletionView } from "@/features/legal/account-deletion-view";
import { LegalBackBar } from "@/features/legal/legal-back-bar";

export const metadata: Metadata = {
  title: `${ACCOUNT_DELETION.title} | PassMate`,
};

/**
 * C-06 계정 삭제 요청 (웹) — Google Play Console "계정 삭제 링크"에 거는 공개 페이지.
 * 정적 안내라 상태가 없다. 약관처럼 서버 컴포넌트로 두어 심사 봇이 첫 HTML에서 읽는다.
 */
export default function Page() {
  return (
    <>
      <SiteHeader className="max-md:hidden" logoLink />
      <AccountDeletionView mobileTopBar={<LegalBackBar title={ACCOUNT_DELETION.title} />} />
    </>
  );
}
