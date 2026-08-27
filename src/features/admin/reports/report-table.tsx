import { formatRelativeTime } from "@/lib/format";
import type { AdminReport, ReportStatus, ReportTargetKind, ReportType } from "@/lib/types/dto";
import { AdminTable, type AdminTableColumn } from "../components/admin-table";
import { StatChip } from "../components/stat-chip";
import type { Tone } from "../components/tone";

/** 시안(admin/A-04 신고 목록) 기준: 신고 ID 열만 고정 폭, 나머지 6열 균등. */
const ID_COL_W = 98;
const ANONYMOUS = "익명";

const TARGET_SUFFIX: Record<ReportTargetKind, (label: string) => string> = {
  STUDENT: (l) => `${l} (학생)`,
  TEACHER: (l) => `${l} (선생님)`,
  GUEST: (l) => `${l} (게스트)`,
  QUESTION: (l) => `${l} (문제)`,
  ROOM: (l) => `방 ${l}`,
};

/** 운영 신고는 시안에서 칩 없이 글자만 보인다 (tone null). */
const TYPE_CHIP: Record<ReportType, { label: string; tone: Tone | null }> = {
  NICKNAME: { label: "닉네임", tone: "warning" },
  QUESTION_ERROR: { label: "문제 오류", tone: "info" },
  PAID_ROOM: { label: "유료 방", tone: "success" },
  OPERATION: { label: "운영", tone: null },
  SPAM: { label: "도배", tone: "warning" },
};

const STATUS_CHIP: Record<ReportStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "미처리", tone: "danger" },
  REVIEWING: { label: "검토 중", tone: "warning" },
  RESOLVED: { label: "처리 완료", tone: "success" },
};

type Props = {
  reports: AdminReport[];
  /** 상대 시각의 기준 시각(ms) */
  nowMs: number;
};

/** 접수된 신고 목록 표. */
export function ReportTable({ reports, nowMs }: Props) {
  const columns = buildColumns(nowMs);

  return (
    <AdminTable
      columns={columns}
      rows={reports}
      rowKey={(r) => r.id}
      emptyMessage="접수된 신고가 없습니다."
    />
  );
}

function buildColumns(nowMs: number): AdminTableColumn<AdminReport>[] {
  return [
    {
      key: "id",
      header: "신고 ID",
      width: ID_COL_W,
      render: (r) => <p className="text-label-lg text-foreground">{r.id}</p>,
    },
    {
      key: "target",
      header: "대상",
      render: (r) => (
        <p className="truncate text-label-md text-muted-foreground">
          {TARGET_SUFFIX[r.target.kind](r.target.label)}
        </p>
      ),
    },
    {
      key: "type",
      header: "유형",
      render: (r) => {
        const chip = TYPE_CHIP[r.type];
        if (chip.tone === null) {
          return <p className="text-label-md text-muted-foreground">{chip.label}</p>;
        }
        return <StatChip tone={chip.tone}>{chip.label}</StatChip>;
      },
    },
    {
      key: "reason",
      header: "사유",
      render: (r) => <p className="truncate text-label-md text-muted-foreground">{r.reason}</p>,
    },
    {
      key: "reporter",
      header: "신고자",
      render: (r) => (
        <p className="text-label-md text-muted-foreground">{r.reporterName ?? ANONYMOUS}</p>
      ),
    },
    {
      key: "receivedAt",
      header: "접수",
      render: (r) => (
        <p className="text-label-md text-muted-foreground">
          {formatRelativeTime(r.receivedAt, nowMs)}
        </p>
      ),
    },
    {
      key: "status",
      header: "상태",
      render: (r) => (
        <StatChip tone={STATUS_CHIP[r.status].tone}>{STATUS_CHIP[r.status].label}</StatChip>
      ),
    },
  ];
}
