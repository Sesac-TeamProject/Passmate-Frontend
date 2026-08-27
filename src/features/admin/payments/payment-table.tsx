import { formatKrwInline } from "@/lib/format";
import type { AdminPayment, PaymentStatus } from "@/lib/types/dto";
import { AdminTable, type AdminTableColumn } from "../components/admin-table";
import { StatChip } from "../components/stat-chip";
import type { Tone } from "../components/tone";

/** 시안(admin/A-05 결제 내역) 기준: 결제 ID 열만 고정 폭, 나머지 7열 균등. */
const ID_COL_W = 98;

const STATUS_CHIP: Record<PaymentStatus, { label: string; tone: Tone }> = {
  COMPLETED: { label: "완료", tone: "success" },
  REFUNDED: { label: "환불", tone: "danger" },
  PENDING: { label: "대기", tone: "warning" },
};

const COLUMNS: AdminTableColumn<AdminPayment>[] = [
  {
    key: "id",
    header: "결제 ID",
    width: ID_COL_W,
    render: (p) => <p className="text-label-lg text-foreground">{p.id}</p>,
  },
  {
    key: "room",
    header: "방",
    render: (p) => <p className="truncate text-label-md text-muted-foreground">{p.roomTitle}</p>,
  },
  {
    key: "teacher",
    header: "선생님",
    render: (p) => <p className="text-label-md text-muted-foreground">{p.teacherName}</p>,
  },
  {
    key: "student",
    header: "학생",
    render: (p) => <p className="text-label-md text-muted-foreground">{p.studentName}</p>,
  },
  {
    key: "amount",
    header: "결제액",
    render: (p) => (
      <p className="text-label-md text-muted-foreground">{formatKrwInline(p.amountKrw)}</p>
    ),
  },
  {
    key: "teacherShare",
    header: "선생님 정산",
    render: (p) => (
      <p className="text-label-md text-muted-foreground">{formatKrwInline(p.teacherShareKrw)}</p>
    ),
  },
  {
    key: "platformFee",
    header: "플랫폼",
    render: (p) => (
      <p className="text-label-md text-muted-foreground">{formatKrwInline(p.platformFeeKrw)}</p>
    ),
  },
  {
    key: "status",
    header: "상태",
    render: (p) => (
      <StatChip tone={STATUS_CHIP[p.status].tone}>{STATUS_CHIP[p.status].label}</StatChip>
    ),
  },
];

type Props = { payments: AdminPayment[] };

/** 유료 방 결제 내역 표. */
export function PaymentTable({ payments }: Props) {
  return (
    <AdminTable
      columns={COLUMNS}
      rows={payments}
      rowKey={(p) => p.id}
      emptyMessage="결제 내역이 없습니다."
    />
  );
}
