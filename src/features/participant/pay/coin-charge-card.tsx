import { KeyValueRow } from "@/components/common/key-value-row";
import { StatusChip } from "@/components/common/status-chip";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PAY_METHOD_LABEL, type PayMethod } from "@/lib/portone";
import { cn } from "@/lib/utils";
import { formatCoin, formatWon } from "./format";

const PAY_METHODS = Object.keys(PAY_METHOD_LABEL) as PayMethod[];

/** 선택형 알약/라디오 행 공통 — 선택 mint-bg + 1.5px mint 테두리, 비선택 흰 카드 + 1px 테두리 */
const SELECTABLE_CLASS = {
  on: "border-[1.5px] border-mint bg-mint-bg text-mint-dark",
  off: "border bg-card text-ink",
};

type Props = {
  balance: number;
  fee: number;
  chargeOptions: readonly number[];
  chargeAmount: number;
  payMethod: PayMethod;
  agreed: boolean;
  /** 결제창을 여는 중 — CTA 잠금 */
  paying: boolean;
  /** 결제 실패·취소 안내 문구 (없으면 숨김) */
  error?: string | null;
  onChargeAmountChange: (amount: number) => void;
  onPayMethodChange: (method: PayMethod) => void;
  onAgreedChange: (agreed: boolean) => void;
  onSubmit: () => void;
};

/** 결제 카드 — 코인 요약 · 충전 금액 · 결제 수단 · 합계 · 동의 · CTA */
export function CoinChargeCard({
  balance,
  fee,
  chargeOptions,
  chargeAmount,
  payMethod,
  agreed,
  paying,
  error,
  onChargeAmountChange,
  onPayMethodChange,
  onAgreedChange,
  onSubmit,
}: Props) {
  const shortage = Math.max(0, fee - balance);

  return (
    <section className="flex w-[440px] shrink-0 flex-col gap-4 rounded-2xl border bg-card px-[22px] py-5">
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-destructive-soft px-3.5 py-3 text-label-md text-destructive"
        >
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <h2 className="text-heading-sm text-ink">코인 충전 — 결제 수단</h2>
        <StatusChip tone="topic">PortOne 안전결제</StatusChip>
      </div>

      <div className="flex flex-col gap-2 rounded-xl bg-muted px-3.5 py-3">
        <KeyValueRow label="보유 코인" value={formatCoin(balance)} />
        <KeyValueRow label="충전 금액" value={formatCoin(chargeAmount)} />
        <KeyValueRow
          label="부족한 코인"
          value={
            shortage > 0 ? (
              <span className="text-negative">{formatCoin(shortage)} → 충전 필요</span>
            ) : (
              "없음"
            )
          }
        />
      </div>

      <div className="flex flex-col gap-2">
        <span id="pay-charge-label" className="text-label-md text-muted-foreground">
          충전 금액 (1 C = ₩1)
        </span>
        <div className="flex gap-2" role="group" aria-labelledby="pay-charge-label">
          {chargeOptions.map((amount) => {
            const selected = amount === chargeAmount;
            return (
              <button
                key={amount}
                type="button"
                aria-pressed={selected}
                disabled={paying}
                onClick={() => onChargeAmountChange(amount)}
                className={cn(
                  "flex-1 rounded-[10px] py-2.5 text-center text-label-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-mint disabled:opacity-50",
                  selected ? SELECTABLE_CLASS.on : SELECTABLE_CLASS.off,
                )}
              >
                {formatCoin(amount)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2" role="radiogroup" aria-label="결제 수단">
        {PAY_METHODS.map((method) => {
          const selected = method === payMethod;
          return (
            <button
              key={method}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={paying}
              onClick={() => onPayMethodChange(method)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-3 text-label-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-mint disabled:opacity-50",
                selected ? SELECTABLE_CLASS.on : SELECTABLE_CLASS.off,
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "size-[18px] shrink-0 rounded-full",
                  selected ? "bg-mint" : "border-[1.5px] bg-card",
                )}
              />
              {PAY_METHOD_LABEL[method]}
            </button>
          );
        })}
      </div>

      <div className="h-px bg-border" />

      <div className="flex flex-col gap-2">
        <KeyValueRow label="충전 금액" value={formatWon(chargeAmount)} />
        <KeyValueRow label="충전 후 차감" value={`-${formatCoin(fee)}`} />
        <KeyValueRow label="포트원 결제 금액" value={formatWon(chargeAmount)} emphasis />
      </div>

      <label className="flex items-center gap-2 text-label-md text-muted-foreground">
        <Checkbox
          className="size-[18px] rounded-[5px] bg-card"
          checked={agreed}
          onCheckedChange={(checked) => onAgreedChange(checked)}
          disabled={paying}
        />
        결제 진행 및 환불 정책에 동의합니다
      </label>

      <Button
        size="xl"
        className="h-[52px] w-full rounded-[14px]"
        disabled={!agreed || paying}
        onClick={onSubmit}
      >
        {paying
          ? "결제창 여는 중…"
          : `${formatWon(chargeAmount)} 충전 → ${formatCoin(fee)} 차감하고 입장`}
      </Button>

      <p className="text-label-md text-ink-disabled">
        충전은 포트원(PortOne)으로 결제되고, 입장 시 코인이 차감돼요. 남은 코인은 다음 유료 방에 쓸
        수 있어요
      </p>
    </section>
  );
}
