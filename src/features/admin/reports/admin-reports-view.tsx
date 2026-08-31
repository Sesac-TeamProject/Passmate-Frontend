import type { AdminReportsResponse, AdminSanctionsResponse } from "@/lib/types/dto";
import { AdminCard } from "../components/admin-card";
import { AdminCardHead } from "../components/admin-card-head";
import { ReportKpiRow } from "./report-kpi-row";
import { ReportTable } from "./report-table";
import { SanctionTable } from "./sanction-table";

type Props = {
  reports: AdminReportsResponse;
  sanctions: AdminSanctionsResponse;
  /** 데이터를 받은 시각(ms). "N분 전" 표기의 기준 */
  fetchedAtMs: number;
};

/** A-04 신고 · 제재 관리 렌더 전용 뷰 (규칙 문서 §11-1). */
export function AdminReportsView({ reports, sanctions, fetchedAtMs }: Props) {
  return (
    <div className="flex flex-1 flex-col gap-[14px] px-7 pt-4 pb-[14px]">
      <ReportKpiRow kpis={reports.kpis} />
      <AdminCard>
        <AdminCardHead title="신고 목록" hint="최근 접수순" />
        <ReportTable reports={reports.items} nowMs={fetchedAtMs} />
      </AdminCard>
      <AdminCard className="min-h-0 flex-1">
        <AdminCardHead title="제재 이력" hint="최근 30일" />
        <SanctionTable sanctions={sanctions.items} />
      </AdminCard>
    </div>
  );
}
