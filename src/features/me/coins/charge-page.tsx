import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CoinBalanceCard } from "@/features/me/coins/coin-balance-card";
import { CHARGE_PRESETS } from "@/features/me/coins/mock";
import { MeFormPage } from "@/features/me/settings/me-form-page";
import { formatKrwInline } from "@/lib/format";
import { PAY_METHOD_LABEL, type PayMethod } from "@/lib/portone";
import { cn } from "@/lib/utils";

/** 충전 화면에서 고를 수 있는 결제 수단 (시안 4종 — 계좌이체는 포트원 결제창 안에서만) */
export const CHARGE_PAY_METHODS: PayMethod[] = ["kakaopay", "naverpay", "tosspay", "card"];

type Props = {
  balance: number;
  amount: number;
  onAmountChange: (amount: number) => void;
  payMethod: PayMethod;
  onPayMethodChange: (method: PayMethod) => void;
  /** 결제창 여는 중 */
  pending: boolean;
  /** 결제 실패·취소 메시지 (시안 없음 — 카드 상단 인라인 알림) */
  error?: string | null;
  onSubmit: () => void;
};

/** C-02-4 코인 충전 — 잔액 · 금액 칩 4개 · 결제 수단 라디오 4행 · 안내 · 충전 버튼 (C-02-5 결제창은 포트원 SDK가 띄운다) */
export function ChargePage({
  balance,
  amount,
  onAmountChange,
  payMethod,
  onPayMethodChange,
  pending,
  error,
  onSubmit,
}: Props) {
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

      <span className="text-label-lg text-foreground">결제 수단</span>
      <RadioGroup
        aria-label="결제 수단"
        value={payMethod}
        onValueChange={(value) => onPayMethodChange(value as PayMethod)}
        className="gap-4"
      >
        {CHARGE_PAY_METHODS.map((method) => {
          const selected = method === payMethod;
          return (
            <label
              key={method}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-3 text-label-lg transition-colors",
                selected
                  ? "border-mint bg-mint-bg text-foreground"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              <RadioGroupItem
                value={method}
                className="size-[18px] border-border bg-card data-checked:border-mint data-checked:bg-card [&_[data-slot=radio-group-indicator]>span]:bg-mint"
              />
              {PAY_METHOD_LABEL[method]}
            </label>
          );
        })}
      </RadioGroup>

      <p className="text-label-md text-muted-foreground">
        1 C = ₩1 · 포트원(PortOne) 안전 결제 · 충전 후 7일 내 미사용 시 환불 가능
      </p>

      <Button size="xl" className="w-full" onClick={onSubmit} disabled={pending}>
        {pending ? "결제창 여는 중…" : `${formatKrwInline(amount)} 충전하기`}
      </Button>
    </MeFormPage>
  );
}
