import { KeyValueRow } from "@/components/common/key-value-row";
import { StatusChip } from "@/components/common/status-chip";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PendingLabel } from "@/components/common/pending-label";
import { cn } from "@/lib/utils";
import { toPayPlan } from "./adapt";
import { formatCoin, formatWon } from "./format";

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
  agreed: boolean;
  /** 결제창을 여는 중 — CTA 잠금 */
  paying: boolean;
  /** 결제 실패·취소 안내 문구 (없으면 숨김) */
  error?: string | null;
  onChargeAmountChange: (amount: number) => void;
  onAgreedChange: (agreed: boolean) => void;
  onSubmit: () => void;
};

/**
 * 결제 카드 — 코인 요약 · 충전 금액 · 합계 · 동의 · CTA.
 * 결제 수단 라디오는 뺐다(2026-09-07) — 포트원 결제창이 수단 선택을 겸하고,
 * 실제로 쓴 수단은 서버가 포트원 조회로 기록한다.
 */
export function CoinChargeCard({
  balance,
  fee,
  chargeOptions,
  chargeAmount,
  agreed,
  paying,
  error,
  onChargeAmountChange,
  onAgreedChange,
  onSubmit,
}: Props) {
  const plan = toPayPlan(balance, fee, chargeAmount);
  const { shortage, needsCharge } = plan;

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
        <h2 className="text-heading-sm text-ink">
          {needsCharge ? "코인 충전 — 결제 수단" : "참가비 — 코인 차감"}
        </h2>
        {needsCharge && <StatusChip tone="topic">PortOne 안전결제</StatusChip>}
      </div>

      <div className="flex flex-col gap-2 rounded-xl bg-muted px-3.5 py-3">
        <KeyValueRow label="보유 코인" value={formatCoin(balance)} />
        {needsCharge && <KeyValueRow label="충전 금액" value={formatCoin(chargeAmount)} />}
        <KeyValueRow
          label="부족한 코인"
          value={
            needsCharge ? (
              <span className="text-negative">{formatCoin(shortage)} → 충전 필요</span>
            ) : (
              "없음 · 충전 없이 입장할 수 있어요"
            )
          }
        />
      </div>

      {/* 잔액이 충분하면 충전 단계가 통째로 빠진다 — 요청도 참가비 차감만 나간다(2026-09-09 S-03) */}
      {needsCharge && (
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
      )}

      <div className="h-px bg-border" />

      <div className="flex flex-col gap-2">
        {needsCharge && <KeyValueRow label="충전 금액" value={formatWon(chargeAmount)} />}
        <KeyValueRow
          label={needsCharge ? "충전 후 차감" : "차감할 코인"}
          value={`-${formatCoin(fee)}`}
          emphasis={!needsCharge}
        />
        {needsCharge && (
          <KeyValueRow label="포트원 결제 금액" value={formatWon(plan.portoneAmount)} emphasis />
        )}
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
        {paying ? (
          <PendingLabel>{needsCharge ? "결제창 여는 중…" : "입장하는 중…"}</PendingLabel>
        ) : (
          plan.cta
        )}
      </Button>

      <p className="text-label-md text-ink-disabled">
        {needsCharge
          ? "결제 수단은 포트원(PortOne) 결제창에서 골라요. 입장 시 코인이 차감되고, 남은 코인은 다음 유료 방에 쓸 수 있어요"
          : "보유 코인에서 참가비만 빠져요. 세션 시작 전에 취소하면 코인이 전액 돌아와요"}
      </p>
    </section>
  );
}
