"use client";

import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { AdminBrandedView } from "@/features/admin/branded/admin-branded-view";
import { AdminPageHeader } from "@/features/admin/layout/admin-page-header";
import { useAdminAdCampaigns } from "@/lib/queries/use-admin-ad-campaigns";
import { useAdminBrandedQuizzes } from "@/lib/queries/use-admin-branded-quizzes";

const ROUTE_PATH = "/admin/branded";
/** A-06은 검색 대상이 다르다 (시안: 캠페인 · 기업 · 방 코드) */
const SEARCH_PLACEHOLDER = "검색 (캠페인 · 기업 · 방 코드)";

/** A-06 컨테이너. 캠페인·브랜디드 퀴즈 두 쿼리를 묶어 로딩·에러를 화면 단위로 분기한다. */
export default function Page() {
  const campaigns = useAdminAdCampaigns();
  const quizzes = useAdminBrandedQuizzes();

  const isPending = campaigns.isPending || quizzes.isPending;
  const error = campaigns.error ?? quizzes.error;

  const handleRetry = () => {
    if (campaigns.isError) void campaigns.refetch();
    if (quizzes.isError) void quizzes.refetch();
  };

  let body: React.ReactNode;
  if (isPending) {
    body = <ScreenLoading />;
  } else if (error || !campaigns.data || !quizzes.data) {
    body = <ScreenError message={error?.message ?? "불러오지 못했습니다."} onRetry={handleRetry} />;
  } else {
    body = <AdminBrandedView campaigns={campaigns.data} quizzes={quizzes.data} />;
  }

  return (
    <>
      <AdminPageHeader path={ROUTE_PATH} searchPlaceholder={SEARCH_PLACEHOLDER} />
      {body}
    </>
  );
}
