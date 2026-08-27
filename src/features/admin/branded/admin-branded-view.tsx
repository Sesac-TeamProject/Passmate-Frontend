import type { AdminAdCampaignsResponse, AdminBrandedQuizzesResponse } from "@/lib/types/dto";
import { AdminCard } from "../components/admin-card";
import { AdminCardHead } from "../components/admin-card-head";
import { AdCampaignTable } from "./ad-campaign-table";
import { BrandedKpiRow } from "./branded-kpi-row";
import { BrandedQuizTable } from "./branded-quiz-table";

type Props = {
  campaigns: AdminAdCampaignsResponse;
  quizzes: AdminBrandedQuizzesResponse;
};

/** A-06 광고 · 브랜디드 퀴즈 렌더 전용 뷰 (규칙 문서 §11-1). */
export function AdminBrandedView({ campaigns, quizzes }: Props) {
  return (
    <div className="flex flex-1 flex-col gap-[14px] px-7 pt-4 pb-[14px]">
      <BrandedKpiRow kpis={campaigns.kpis} />
      <AdminCard>
        <AdminCardHead title="광고 캠페인" hint="노출 위치별 집행 현황" />
        <AdCampaignTable campaigns={campaigns.items} />
      </AdminCard>
      <AdminCard className="min-h-0 flex-1">
        <AdminCardHead title="기업 브랜디드 퀴즈" hint="플랫폼이 선생님 역할을 대행" />
        <BrandedQuizTable quizzes={quizzes.items} />
      </AdminCard>
    </div>
  );
}
