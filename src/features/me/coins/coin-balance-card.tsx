import { Coins } from "lucide-react";
import { formatNumber } from "@/lib/format";

type Props = { balance: number };

/** `card/잔액` — 민트 배경 r16 · 코인 아이콘 · "보유 코인" · 우측 heading-md 잔액 (C-02-4 · C-02-9 공통) */
export function CoinBalanceCard({ balance }: Props) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl bg-mint-bg px-4 py-3.5">
      <Coins className="size-6 text-foreground" strokeWidth={2} aria-hidden />
      <span className="text-body-md text-muted-foreground">보유 코인</span>
      <span className="ml-auto text-heading-md text-mint-dark">{formatNumber(balance)} C</span>
    </div>
  );
}
