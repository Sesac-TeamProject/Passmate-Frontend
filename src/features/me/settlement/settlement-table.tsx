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

/**
 * W-10 결제 · 정산 내역 표 — r20 카드 · 7열 grid · 상태 칩(정산 예정 choice-c / 지급 완료 choice-d).
 *
 * 7열 grid는 합이 800px을 넘어 390px에서 가로 스크롤이 난다 — 폰 폭(768px 미만)에서는 표를 감추고
 * 같은 데이터를 받는 `SettlementRowsMobile` 줄 목록을 대신 낸다(앱 M-T4).
 */
export function SettlementTable({ rows }: Props) {
  return (
    <>
      <SettlementTableDesktop rows={rows} />
      <SettlementRowsMobile rows={rows} />
    </>
  );
}

function SettlementTableDesktop({ rows }: Props) {
  return (
    <div role="table" className="rounded-[20px] border bg-card px-2 py-1 max-md:hidden">
      <div role="row" className={cn(GRID_CLASS, "text-label-lg text-muted-foreground")}>
        {COLUMNS.map((column) => (
          <span key={column} role="columnheader">
            {column}
          </span>
        ))}
      </div>
      {/* 유료 방을 아직 안 연 선생님은 0건이다 — 헤더만 남겨 두면 표가 깨진 것처럼 보인다 */}
      {rows.length === 0 && (
        <div role="row" className="border-t">
          {/* role="row"는 cell을 가져야 한다 — 없으면 리더가 이 줄을 통째로 건너뛴다 */}
          <span
            role="cell"
            className="block px-4 py-10 text-center text-body-md text-muted-foreground"
          >
            아직 정산 내역이 없어요. 유료 방을 열면 참가비 정산이 여기에 쌓여요
          </span>
        </div>
      )}
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

/**
 * 폰 폭(768px 미만) 정산 내역 — 앱 M-T4처럼 표 대신 줄 목록. 한 줄에 방 이름 · 날짜 · 금액(정산액) ·
 * 상태만 싣는다(참가 인원 · 참가비 합계 · 수수료는 표에만 남는다).
 */
function SettlementRowsMobile({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border bg-card px-[18px] py-10 text-center text-body-md text-muted-foreground md:hidden">
        아직 정산 내역이 없어요. 유료 방을 열면 참가비 정산이 여기에 쌓여요
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y rounded-2xl border bg-card md:hidden">
      {rows.map((row) => (
        <li key={row.id} className="flex items-center gap-3 px-[18px] py-3.5">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-label-lg text-foreground">{row.roomTitle}</span>
            <span className="text-label-md text-muted-foreground">{row.dateLabel}</span>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-0.5">
            <span className="text-label-lg text-foreground">{formatWon(row.payout, true)}</span>
            <span className="text-label-md text-muted-foreground">
              {SETTLEMENT_STATUS_LABEL[row.status]}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
