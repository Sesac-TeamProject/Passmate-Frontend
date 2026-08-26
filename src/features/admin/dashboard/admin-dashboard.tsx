import { AdminPageHeader } from "../layout/admin-page-header";
import { DailySessionsCard } from "./daily-sessions-card";
import { KpiRow } from "./kpi-row";
import { PopularTopicsCard } from "./popular-topics-card";
import { RecentActivityCard } from "./recent-activity-card";
import { SystemStatusCard } from "./system-status-card";
import { UserCompositionCard } from "./user-composition-card";

/** A-01 대시보드 (전체 지표). */
export function AdminDashboard() {
  return (
    <>
      <AdminPageHeader path="/admin/dashboard" />
      <div className="flex flex-1 flex-col gap-[14px] px-7 pt-4 pb-[10px]">
        <KpiRow />
        <div className="flex w-full flex-col gap-[14px] xl:flex-row xl:items-start">
          <DailySessionsCard />
          <RecentActivityCard />
        </div>
        <div className="flex w-full flex-col gap-[14px] xl:flex-row xl:items-start">
          <UserCompositionCard />
          <PopularTopicsCard />
          <SystemStatusCard />
        </div>
      </div>
    </>
  );
}
