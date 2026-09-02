import { formatKrw, formatNumber } from "@/lib/format";
import type { AdminRoomStatus, AdminRoomSummary } from "@/lib/types/dto";
import { AdminTable, type AdminTableColumn } from "../components/admin-table";
import { StatChip } from "../components/stat-chip";
import type { Tone } from "../components/tone";

/** 시안(admin/A-03 방 목록) 기준: 방 코드 열만 고정 폭, 나머지 5열 균등. */
const PIN_COL_W = 98;

const STATUS_CHIP: Record<AdminRoomStatus, { label: string; tone: Tone }> = {
  RUNNING: { label: "진행 중", tone: "success" },
  WAITING: { label: "대기실", tone: "info" },
  FINISHED: { label: "종료", tone: "neutral" },
};

const COLUMNS: AdminTableColumn<AdminRoomSummary>[] = [
  {
    key: "pin",
    header: "방 코드",
    width: PIN_COL_W,
    render: (r) => <p className="text-label-lg text-foreground">{r.pin}</p>,
  },
  {
    key: "title",
    header: "제목",
    render: (r) => <p className="truncate text-label-md text-muted-foreground">{r.title}</p>,
  },
  {
    key: "host",
    header: "선생님",
    render: (r) => <p className="text-label-md text-muted-foreground">{r.hostName}</p>,
  },
  {
    key: "participants",
    header: "인원",
    render: (r) => (
      <p className="text-label-md text-muted-foreground">{formatNumber(r.participantCount)}명</p>
    ),
  },
  {
    key: "kind",
    header: "유형",
    render: (r) => {
      const chip = kindChip(r);
      return <StatChip tone={chip.tone}>{chip.label}</StatChip>;
    },
  },
  {
    key: "status",
    header: "상태",
    render: (r) => (
      <StatChip tone={STATUS_CHIP[r.status].tone}>{STATUS_CHIP[r.status].label}</StatChip>
    ),
  },
];

type Props = { rooms: AdminRoomSummary[] };

/** 진행 중·대기·종료 방 목록 표. */
export function RoomTable({ rooms }: Props) {
  return (
    <AdminTable
      columns={COLUMNS}
      rows={rooms}
      rowKey={(r) => r.pin}
      emptyMessage="표시할 방이 없습니다."
    />
  );
}

function kindChip(r: AdminRoomSummary): { label: string; tone: Tone } {
  if (r.kind === "PAID") return { label: `유료 ${formatKrw(r.entryFeeKrw ?? 0)}`, tone: "warning" };
  if (r.kind === "BRANDED") return { label: "브랜디드", tone: "brand" };
  return { label: "무료", tone: "neutral" };
}
