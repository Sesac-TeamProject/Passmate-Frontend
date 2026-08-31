import { formatKrw, formatNumber } from "@/lib/format";
import type { AdminSettlement, SettlementStatus } from "@/lib/types/dto";
import { AdminTable, type AdminTableColumn } from "../components/admin-table";
import { StatChip } from "../components/stat-chip";
import type { Tone } from "../components/tone";

/** 시안(admin/A-05 정산 대기) 기준: 선생님 열만 고정 폭, 나머지 6열 균등. */
const NAME_COL_W = 160;
const EMPTY = "—";

const STATUS_CHIP: Record<SettlementStatus, { label: string; tone: Tone }> = {
  CONFIRMED: { label: "확인 완료", tone: "success" },
  ACCOUNT_MISSING: { label: "계좌 미등록", tone: "danger" },
};

const COLUMNS: AdminTableColumn<AdminSettlement>[] = [
  {
    key: "teacher",
    header: "선생님",
    width: NAME_COL_W,
    render: (s) => <p className="truncate text-label-lg text-foreground">{s.teacherName}</p>,
  },
  {
    key: "hostLevel",
    header: "명성",
    render: (s) => <p className="text-label-md text-muted-foreground">Lv.{s.hostLevel}</p>,
  },
  {
    key: "paidRooms",
    header: "유료 방",
    render: (s) => (
      <p className="text-label-md text-muted-foreground">{formatNumber(s.paidRoomCount)}개</p>
    ),
  },
  {
    key: "payments",
    header: "결제 건수",
    render: (s) => (
      <p className="text-label-md text-muted-foreground">{formatNumber(s.paymentCount)}건</p>
    ),
  },
  {
    key: "payout",
    header: "정산 예정액",
    render: (s) => <p className="text-label-md text-muted-foreground">{formatKrw(s.payoutKrw)}</p>,
  },
  {
    key: "account",
    header: "계좌",
    render: (s) => (
      <p className="text-label-md text-muted-foreground">
        {s.bankAccount ? `${s.bankAccount.bank} ${s.bankAccount.maskedNumber}` : EMPTY}
      </p>
    ),
  },
  {
    key: "status",
    header: "상태",
    render: (s) => (
      <StatChip tone={STATUS_CHIP[s.status].tone}>{STATUS_CHIP[s.status].label}</StatChip>
    ),
  },
];

type Props = { settlements: AdminSettlement[] };

/** 다음 정산일 지급 대기 선생님 표. */
export function SettlementTable({ settlements }: Props) {
  return (
    <AdminTable
      columns={COLUMNS}
      rows={settlements}
      rowKey={(s) => s.teacherId}
      emptyMessage="정산 대기 중인 선생님이 없습니다."
    />
  );
}
