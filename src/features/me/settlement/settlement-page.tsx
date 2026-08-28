import Link from "next/link";
import { HeroBanner } from "@/components/common/hero-banner";
import { InitialTile } from "@/components/common/initial-tile";
import { StatCards } from "@/components/common/stat-cards";
import { SETTLEMENT_ACCOUNT } from "@/features/me/mock";
import { SETTLEMENT_ROWS, SETTLEMENT_STATS } from "@/features/me/settlement/mock";
import { SettlementTable } from "@/features/me/settlement/settlement-table";

/** W-10 정산 — 배너 · 요약 3장 · 결제/정산 내역 표 · 정산 계좌 카드 */
export function SettlementPage() {
  return (
    <main className="flex flex-col gap-6 px-9 py-7">
      <HeroBanner
        title="정산"
        description="유료 방 참가비 정산 내역 · 선생님 80% / 플랫폼 20% · 매월 5일 지급"
        action={
          <Link
            href="/me/settlement-account"
            className="flex h-13 shrink-0 items-center rounded-2xl bg-mint px-6 text-heading-sm text-white hover:bg-mint-dark"
          >
            계좌 관리
          </Link>
        }
      />

      <StatCards stats={SETTLEMENT_STATS} />

      <section className="flex flex-col gap-3">
        <header className="flex items-center justify-between">
          <h2 className="text-heading-sm text-ink">결제 · 정산 내역</h2>
          {/* TODO(API): 정산 내역 CSV 다운로드 — lib/api/client.ts download */}
          <Link href="#" className="text-label-lg text-mint-dark">
            CSV 내보내기 ›
          </Link>
        </header>
        <SettlementTable rows={SETTLEMENT_ROWS} />
      </section>

      <section className="flex items-center gap-4 rounded-[20px] border bg-card px-6 py-[18px]">
        <InitialTile label="B" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-label-lg text-ink">
            정산 계좌&nbsp;&nbsp;{SETTLEMENT_ACCOUNT.bank} {SETTLEMENT_ACCOUNT.maskedNumber} (
            {SETTLEMENT_ACCOUNT.holder})
          </span>
          <span className="text-label-md text-muted-foreground">
            정산 주기 · 환불 정책 · 사업소득 세금 신고(3.3% 원천징수) 는 확정 전 — 기획서 §13.5 결정
            항목
          </span>
        </div>
        <Link
          href="/me/settlement-account"
          className="flex h-[38px] shrink-0 items-center rounded-xl bg-muted px-[18px] text-label-lg text-mint-dark hover:bg-mint-bg"
        >
          계좌 변경
        </Link>
      </section>
    </main>
  );
}
