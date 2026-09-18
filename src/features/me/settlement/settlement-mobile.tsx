import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { StatItem } from "@/components/common/stat-cards";
import { StatusChip } from "@/components/common/status-chip";
import { formatWon } from "@/lib/format";
import { cn } from "@/lib/utils";
import { STATUS_CLASS } from "./settlement-table";
import { SETTLEMENT_STATUS_LABEL, type SettlementRow } from "./types";

type Props = {
  stats: StatItem[];
  rows: SettlementRow[];
  account: { bank: string; maskedNumber: string } | null;
  onExport: () => void;
  exporting: boolean;
  exportError: string | null;
};

/**
 * M-T4 정산 (앱) — 시안 v6 `03 · 앱` 349:10199. 렌더 전용.
 *
 * 웹 W-10과 같은 데이터를 받는다. 웹의 요약 칸 세 개(이번 달 수익 · 다음 지급 · 유료 방 운영)는
 * 폰에서 수익 카드 하나로 합친다 — 큰 숫자는 이번 달 수익, 나머지 둘은 그 아래 한 줄.
 * 표는 줄마다 카드로 쌓는다(날짜 · 방 · 인원·참가비·수수료 · 정산액 · 상태).
 *
 * 시안과 다르게 간 곳:
 * - 목록 머리 "전체 보기 ›" 자리에 웹과 같은 "CSV 내보내기 ›"를 둔다. 따로 여는 전체 목록 화면이 없고
 *   이 목록이 이미 전부다 — 누를 곳 없는 링크를 두지 않는다.
 * - 상태 칩 색은 PC 표(STATUS_CLASS)와 같게 둔다. 시안 앱 칩은 한 단계 옅지만, 같은 상태가 화면마다
 *   다른 색이면 안 된다.
 */
export function SettlementMobile({
  stats,
  rows,
  account,
  onExport,
  exporting,
  exportError,
}: Props) {
  const revenue = stats.find((s) => s.id === "revenue");
  const nextPayout = stats.find((s) => s.id === "next-payout");
  const paidRooms = stats.find((s) => s.id === "paid-rooms");
  const summary = [
    nextPayout ? `${nextPayout.label} ${nextPayout.value} 예정` : null,
    paidRooms ? `유료 방 ${paidRooms.value}` : null,
  ]
    .filter((part): part is string => part !== null)
    .join(" · ");

  return (
    // 하단 탭바는 레이아웃((member))이 fixed로 그리고 본문 아래를 그 높이만큼 띄운다 — 최소 높이에서 빼야 헛스크롤이 없다
    <main className="flex min-h-[calc(100dvh-var(--mobile-tab-bar-h))] flex-col bg-card md:hidden">
      <header className="flex items-center gap-3 px-5 pt-14 pb-3">
        <Link href="/me" aria-label="마이페이지로" className="text-ink">
          <ArrowLeft size={24} strokeWidth={2} aria-hidden />
        </Link>
        <h1 className="text-heading-lg text-ink">정산</h1>
        <Link
          href="/me/settlement-account"
          className="ml-auto text-label-lg text-mint-dark transition-colors hover:text-mint"
        >
          계좌 관리
        </Link>
      </header>

      <div className="flex flex-1 flex-col gap-3 px-5 pt-2 pb-5">
        {revenue && (
          <section className="flex flex-col gap-1 rounded-[20px] bg-mint-bg px-[18px] py-4">
            <p className="text-label-md text-mint-deep">{revenue.label}</p>
            <p className="text-display-sm font-bold text-mint-deep tabular-nums">{revenue.value}</p>
            {summary && <p className="text-label-md text-mint-ink-secondary">{summary}</p>}
          </section>
        )}

        <div className="flex items-center justify-between pt-1">
          <h2 className="text-heading-sm text-ink">결제 · 정산 내역</h2>
          <button
            type="button"
            onClick={onExport}
            disabled={exporting}
            className="text-label-lg text-mint-dark disabled:opacity-60"
          >
            {exporting ? "내보내는 중…" : "CSV 내보내기 ›"}
          </button>
        </div>
        {exportError !== null && (
          <p role="alert" className="text-label-md text-negative">
            {exportError}
          </p>
        )}

        {rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed px-4 py-12 text-center text-label-lg text-muted-foreground">
            아직 정산할 유료 방이 없어요
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((row) => (
              <li key={row.id} className="flex items-center gap-2.5 rounded-2xl border px-3.5 py-3">
                <span className="flex h-[34px] w-11 shrink-0 items-center justify-center rounded-[10px] bg-muted text-label-lg text-mint-dark tabular-nums">
                  {row.dateLabel}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className="truncate text-label-lg text-ink">{row.roomTitle}</span>
                    {/* 정산은 유료 방에서만 생긴다 — 줄마다 같은 칩이지만 시안대로 방 유형을 밝힌다 */}
                    <StatusChip tone="paid">₩ 유료</StatusChip>
                  </span>
                  <span className="truncate text-label-md text-muted-foreground">
                    {row.participants}명 · 참가비 {formatWon(row.gross)} · 수수료{" "}
                    {formatWon(row.fee)}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-[3px]">
                  <span className="text-label-lg text-mint-dark tabular-nums">
                    {formatWon(row.payout, true)}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-[3px] text-label-md",
                      STATUS_CLASS[row.status],
                    )}
                  >
                    {SETTLEMENT_STATUS_LABEL[row.status]}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/me/settlement-account"
          className="flex items-center gap-2.5 rounded-2xl border px-3.5 py-3 transition-colors hover:bg-muted"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-mint-tint text-label-lg text-mint-deep">
            {/* 시안·PC 모두 은행 표시 글자는 "B" 고정이다 */}B
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-label-lg text-ink">
              {account ? `${account.bank} ${account.maskedNumber}` : "정산 계좌를 등록해 주세요"}
            </span>
            <span className="truncate text-label-md text-muted-foreground">
              매월 5일 지급 · 사업소득 3.3% 원천징수(확정 전)
            </span>
          </span>
        </Link>
      </div>
    </main>
  );
}
