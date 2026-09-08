import { Button } from "@/components/ui/button";
import { PendingLabel } from "@/components/common/pending-label";
import { CoinBalanceCard } from "@/features/me/coins/coin-balance-card";
import { CHARGE_PRESETS } from "@/features/me/coins/types";
import { MeFormPage } from "@/features/me/settings/me-form-page";
import { formatKrwInline } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  balance: number;
  amount: number;
  onAmountChange: (amount: number) => void;
  /** 결제창 여는 중 */
  pending: boolean;
  /** 결제 실패·취소 메시지 (시안 없음 — 카드 상단 인라인 알림) */
  error?: string | null;
  onSubmit: () => void;
};

/**
 * C-02-4 코인 충전 — 잔액 · 금액 칩 4개 · 안내 · 충전 버튼 (C-02-5 결제창은 포트원 SDK가 띄운다).
 *
 * 시안의 결제 수단 라디오는 뺐다(2026-09-07 결정) — 포트원 결제창이 카드·간편결제를 모두
 * 보여줘 선택이 중복이었고, 실제로 쓴 수단은 서버가 포트원 조회로 기록한다.
 */
export function ChargePage({ balance, amount, onAmountChange, pending, error, onSubmit }: Props) {
  return (
    <MeFormPage title="코인 충전">
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-destructive-soft px-3.5 py-3 text-label-md text-destructive"
        >
          {error}
        </p>
      )}

      <CoinBalanceCard balance={balance} />

      <span className="text-label-lg text-foreground">충전 금액</span>
      <div className="flex gap-2.5" role="group" aria-label="충전 금액">
        {CHARGE_PRESETS.map((preset) => {
          const selected = preset === amount;
          return (
            <button
              key={preset}
              type="button"
              aria-pressed={selected}
              onClick={() => onAmountChange(preset)}
              className={cn(
                "flex-1 rounded-xl border py-3 text-center text-label-lg transition-colors",
                selected
                  ? "border-mint bg-mint-bg text-mint-dark"
                  : "border-border bg-card text-foreground",
              )}
            >
              {formatKrwInline(preset)}
            </button>
          );
        })}
      </div>

      <p className="text-label-md text-muted-foreground">
        1 C = ₩1 · 결제 수단은 결제창에서 골라요 · 포트원(PortOne) 안전 결제 · 충전 후 7일 내 미사용
        시 환불 가능
      </p>

      <Button size="xl" className="w-full" onClick={onSubmit} disabled={pending}>
        {pending ? (
          <PendingLabel>결제창 여는 중…</PendingLabel>
        ) : (
          `${formatKrwInline(amount)} 충전하기`
        )}
      </Button>
    </MeFormPage>
  );
}
