import type { AdminDashboardResponse } from "@/lib/types/dto";
import { DailySessionsCard } from "./daily-sessions-card";
import { KpiRow } from "./kpi-row";
import { PopularTopicsCard } from "./popular-topics-card";
import { RecentActivityCard } from "./recent-activity-card";
import { SystemStatusCard } from "./system-status-card";
import { UserCompositionCard } from "./user-composition-card";

type Props = {
  data: AdminDashboardResponse;
  /** 데이터를 받은 시각(ms). "N분 전" 표기의 기준 */
  fetchedAtMs: number;
};

/** A-01 대시보드 렌더 전용 뷰. 데이터는 page가 쿼리로 받아 props로 넘긴다 (규칙 문서 §11-1). */
export function AdminDashboardView({ data, fetchedAtMs }: Props) {
  return (
    <div className="flex flex-1 flex-col gap-[14px] px-7 pt-4 pb-[10px]">
      <KpiRow kpis={data.kpis} />
      <div className="flex w-full items-stretch gap-[14px]">
        <DailySessionsCard sessions={data.dailySessions} />
        <RecentActivityCard activities={data.recentActivities} nowMs={fetchedAtMs} />
      </div>
      <div className="flex w-full items-start gap-[14px]">
        <UserCompositionCard composition={data.userComposition} />
        <PopularTopicsCard topics={data.popularTopics} />
        <SystemStatusCard components={data.systemStatus} />
      </div>
    </div>
  );
}
