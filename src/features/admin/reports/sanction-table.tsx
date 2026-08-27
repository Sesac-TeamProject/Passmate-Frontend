import { formatDurationHours } from "@/lib/format";
import type { AdminSanction, SanctionStatus, SanctionType } from "@/lib/types/dto";
import { AdminTable, type AdminTableColumn } from "../components/admin-table";
import { StatChip } from "../components/stat-chip";
import type { Tone } from "../components/tone";

/** 시안(admin/A-04 제재 이력) 기준: 계정 열만 고정 폭, 나머지 5열 균등. */
const ACCOUNT_COL_W = 180;
const EMPTY = "—";

const TYPE_LABEL: Record<SanctionType, string> = {
  ACCOUNT_SUSPENDED: "계정 정지",
  JOIN_RESTRICTED: "입장 제한",
  WARNING: "경고",
  AUTHORING_RESTRICTED: "출제 제한",
};

const STATUS_CHIP: Record<SanctionStatus, { label: string; tone: Tone }> = {
  ACTIVE: { label: "집행 중", tone: "danger" },
  WARNING_KEPT: { label: "경고 유지", tone: "warning" },
  LIFTED: { label: "해제 완료", tone: "success" },
};

const COLUMNS: AdminTableColumn<AdminSanction>[] = [
  {
    key: "account",
    header: "계정",
    width: ACCOUNT_COL_W,
    render: (s) => <p className="truncate text-label-lg text-foreground">{s.accountLabel}</p>,
  },
  {
    key: "type",
    header: "제재 유형",
    render: (s) => <p className="text-label-md text-muted-foreground">{TYPE_LABEL[s.type]}</p>,
  },
  {
    key: "reason",
    header: "사유",
    render: (s) => <p className="truncate text-label-md text-muted-foreground">{s.reason}</p>,
  },
  {
    key: "duration",
    header: "기간",
    render: (s) => (
      <p className="text-label-md text-muted-foreground">
        {s.durationHours === null ? EMPTY : formatDurationHours(s.durationHours)}
      </p>
    ),
  },
  {
    key: "executedAt",
    header: "집행일",
    render: (s) => <p className="text-label-md text-muted-foreground">{s.executedAt}</p>,
  },
  {
    key: "status",
    header: "상태",
    render: (s) => (
      <StatChip tone={STATUS_CHIP[s.status].tone}>{STATUS_CHIP[s.status].label}</StatChip>
    ),
  },
];

type Props = { sanctions: AdminSanction[] };

/** 최근 30일 제재 이력 표. */
export function SanctionTable({ sanctions }: Props) {
  return (
    <AdminTable
      columns={COLUMNS}
      rows={sanctions}
      rowKey={(s) => s.id}
      emptyMessage="최근 30일 제재 이력이 없습니다."
    />
  );
}
