import Link from "next/link";
import { HeroBanner } from "@/components/common/hero-banner";
import { InitialTile } from "@/components/common/initial-tile";
import { StatCards, type StatItem } from "@/components/common/stat-cards";
import { SettlementTable } from "@/features/me/settlement/settlement-table";
import type { SettlementRow } from "@/features/me/settlement/types";

type Props = {
  stats: StatItem[];
  rows: SettlementRow[];
  /** 정산 계좌 요약(은행 · 마스킹 번호) — 미등록이면 null */
  account: { bank: string; maskedNumber: string } | null;
};

/** W-10 정산 — 배너 · 요약 3장 · 결제/정산 내역 표 · 정산 계좌 카드 */
export function SettlementPage({ stats, rows, account }: Props) {
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

      <StatCards stats={stats} />

      <section className="flex flex-col gap-3">
        <header className="flex items-center justify-between">
          <h2 className="text-heading-sm text-ink">결제 · 정산 내역</h2>
          {/* TODO(API): 정산 내역 CSV 다운로드 계약 없음 — DESIGN_GAPS에도 미기재(별도 요청 필요). 계약 도착 시 lib/api/client.ts downloadFile로 연결 */}
          <Link href="#" className="text-label-lg text-mint-dark">
            CSV 내보내기 ›
          </Link>
        </header>
        <SettlementTable rows={rows} />
      </section>

      <section className="flex items-center gap-4 rounded-[20px] border bg-card px-6 py-[18px]">
        <InitialTile label="B" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-label-lg text-ink">
            정산 계좌&nbsp;&nbsp;
            {account ? `${account.bank} ${account.maskedNumber}` : "등록된 계좌가 없어요"}
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
          {account ? "계좌 변경" : "계좌 등록"}
        </Link>
      </section>
    </main>
  );
}
