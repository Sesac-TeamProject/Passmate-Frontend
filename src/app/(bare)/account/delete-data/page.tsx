import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { DATA_DELETION } from "@/features/legal/account-deletion";
import { DataDeletionView } from "@/features/legal/account-deletion-view";
import { LegalBackBar } from "@/features/legal/legal-back-bar";

export const metadata: Metadata = {
  title: `${DATA_DELETION.title} | PassMate`,
};

/** C-07 데이터 삭제 요청 (웹) — Google Play Console "데이터 삭제 링크"에 거는 공개 페이지 */
export default function Page() {
  return (
    <>
      <SiteHeader className="max-md:hidden" logoLink />
      <DataDeletionView mobileTopBar={<LegalBackBar title={DATA_DELETION.title} />} />
    </>
  );
}
