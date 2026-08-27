import type { AdminUserSummary } from "@/lib/types/dto";
import { AdminTable, type AdminTableColumn } from "../components/admin-table";
import { StatChip } from "../components/stat-chip";
import type { Tone } from "../components/tone";

/** 시안(admin/A-02, table 노드 167:1310) 기준: 사용자 열만 260px 고정, 나머지 6열 균등. */
const NAME_COL_W = 260;
const EMPTY = "—";

const ROLE_CHIP: Record<AdminUserSummary["role"], { label: string; tone: Tone }> = {
  TEACHER: { label: "선생님", tone: "brand" },
  STUDENT: { label: "학생", tone: "info" },
};

const COLUMNS: AdminTableColumn<AdminUserSummary>[] = [
  {
    key: "name",
    header: "사용자",
    width: NAME_COL_W,
    render: (u) => (
      <p className="truncate text-label-lg text-foreground">
        {displayName(u)}
        {u.email ? <span className="ml-2">{u.email}</span> : null}
      </p>
    ),
  },
  {
    key: "role",
    header: "역할",
    render: (u) => <StatChip tone={ROLE_CHIP[u.role].tone}>{ROLE_CHIP[u.role].label}</StatChip>,
  },
  {
    key: "joinedAt",
    header: "가입일",
    render: (u) => <p className="text-label-md text-muted-foreground">{u.joinedAt ?? EMPTY}</p>,
  },
  {
    key: "sessions",
    header: "참여 세션",
    render: (u) => <p className="text-label-md text-muted-foreground">{u.sessionCount}회</p>,
  },
  {
    key: "hostLevel",
    header: "명성",
    render: (u) => (
      <p className="text-label-md text-muted-foreground">
        {u.hostLevel === null ? EMPTY : `Lv.${u.hostLevel}`}
      </p>
    ),
  },
  {
    key: "status",
    header: "상태",
    render: (u) => {
      const chip = statusChip(u);
      return <StatChip tone={chip.tone}>{chip.label}</StatChip>;
    },
  },
  {
    key: "actions",
    header: "관리",
    render: (u) => <p className="text-label-md text-muted-foreground">{actionLabel(u)}</p>,
  },
];

type Props = { users: AdminUserSummary[] };

/** 사용자 목록 표. */
export function UserTable({ users }: Props) {
  return (
    <AdminTable
      columns={COLUMNS}
      rows={users}
      rowKey={(u) => u.id}
      emptyMessage="조건에 맞는 사용자가 없습니다."
    />
  );
}

function displayName(u: AdminUserSummary): string {
  if (u.status === "GUEST") return `(게스트) ${u.name}`;
  return u.name;
}

function statusChip(u: AdminUserSummary): { label: string; tone: Tone } {
  if (u.status === "GUEST") return { label: "게스트", tone: "muted" };
  if (u.status === "SANCTIONED")
    return { label: `제재 ${u.sanctionDaysLeft ?? 0}일`, tone: "danger" };
  if (u.status === "WARNED") return { label: `경고 ${u.warningCount}`, tone: "warning" };
  return { label: "정상", tone: "success" };
}

/** 행 우측 관리 문구. 제재·정지 액션은 계약 확정 후 버튼으로 바꾼다. */
function actionLabel(u: AdminUserSummary): string {
  if (u.status === "GUEST") return "기록 없음";
  if (u.status === "SANCTIONED") return "해제 · 상세";
  return "상세 · 정지";
}
