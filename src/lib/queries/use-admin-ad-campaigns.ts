import { useQuery } from "@tanstack/react-query";
import { getAdminAdCampaigns } from "@/lib/api/admin";

export const ADMIN_AD_CAMPAIGNS_KEY = ["admin", "ad-campaigns"] as const;

/** A-06 광고 KPI + 캠페인 목록 */
export function useAdminAdCampaigns() {
  return useQuery({ queryKey: ADMIN_AD_CAMPAIGNS_KEY, queryFn: getAdminAdCampaigns });
}
