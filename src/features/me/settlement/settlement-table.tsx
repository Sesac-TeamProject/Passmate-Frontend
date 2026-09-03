import {
  SETTLEMENT_STATUS_LABEL,
  type SettlementRow,
  type SettlementStatus,
} from "@/features/me/settlement/types";
import { formatWon } from "@/lib/format";
import { cn } from "@/lib/utils";

const GRID_CLASS =
  "grid grid-cols-[90px_1fr_90px_130px_170px_150px_120px] items-center gap-4 px-4 py-3.5";

const STATUS_CLASS: Record<SettlementStatus, string> = {
  scheduled: "bg-choice-c text-choice-c-foreground",
  paid: "bg-choice-d text-choice-d-foreground",
  held: "bg-choice-a text-choice-a-foreground",
  // 이월 — 지급 기준에 못 미쳐 다음 회차로 넘어간 건 (서버 CARRIED)
  carried: "bg-muted text-muted-foreground",
};

const COLUMNS = [
  "날짜",
  "방",
  "참가",
  "참가비 합계",
  "플랫폼 수수료 (20%)",
  "정산액 (80%)",
  "상태",
];

type Props = { rows: SettlementRow[] };

/** W-10 결제 · 정산 내역 표 — r20 카드 · 7열 grid · 상태 칩(정산 예정 choice-c / 지급 완료 choice-d) */
export function SettlementTable({ rows }: Props) {
  return (
    <div role="table" className="rounded-[20px] border bg-card px-2 py-1">
      <div role="row" className={cn(GRID_CLASS, "text-label-lg text-muted-foreground")}>
        {COLUMNS.map((column) => (
          <span key={column} role="columnheader">
            {column}
          </span>
        ))}
      </div>
      {rows.map((row) => (
        <div key={row.id} role="row" className={cn(GRID_CLASS, "border-t")}>
          <span role="cell" className="text-body-md text-muted-foreground">
            {row.dateLabel}
          </span>
          <span role="cell" className="truncate text-label-lg text-ink">
            {row.roomTitle}
          </span>
          <span role="cell" className="text-body-md text-muted-foreground">
            {row.participants}명
          </span>
          <span role="cell" className="text-body-md text-muted-foreground">
            {formatWon(row.gross, true)}
          </span>
          <span role="cell" className="text-body-md text-muted-foreground">
            {formatWon(row.fee, true)}
          </span>
          <span role="cell" className="text-label-lg text-mint-dark">
            {formatWon(row.payout, true)}
          </span>
          <span role="cell">
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-label-lg",
                STATUS_CLASS[row.status],
              )}
            >
              {SETTLEMENT_STATUS_LABEL[row.status]}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
