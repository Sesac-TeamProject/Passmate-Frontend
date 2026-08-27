import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MeFormPage } from "@/features/me/settings/me-form-page";
import { formatKrwInline, formatNumber } from "@/lib/format";
import { PAY_METHOD_LABEL, type PayMethod } from "@/lib/portone";

type Props = {
  /** 충전한 코인(= 결제 금액, 1 C = ₩1) */
  amount: number;
  payMethod: PayMethod;
  /** 충전 후 보유 코인 */
  balanceAfter: number;
  onConfirm: () => void;
};

/** C-02-6 코인 충전 완료 — 민트 체크 원 72 · 충전량 · 잔액/수단 · 안내 · 확인 */
export function ChargeCompletePage({ amount, payMethod, balanceAfter, onConfirm }: Props) {
  return (
    <MeFormPage title="코인 충전" cardClassName="items-center gap-3 px-7 py-12">
      <div className="flex size-[72px] items-center justify-center rounded-full bg-mint">
        <Check className="size-8 text-white" strokeWidth={2} aria-hidden />
      </div>
      <h2 className="text-heading-lg text-foreground">{formatNumber(amount)} C 충전 완료</h2>
      <p className="text-body-md text-muted-foreground">
        보유 코인 {formatNumber(balanceAfter)} C · {PAY_METHOD_LABEL[payMethod]}{" "}
        {formatKrwInline(amount)}
      </p>
      <p className="text-label-md text-ink-disabled">
        결제 내역은 마이페이지 › 코인 · 결제에서 볼 수 있어요
      </p>
      <Button size="xl" className="mt-2" onClick={onConfirm}>
        확인
      </Button>
    </MeFormPage>
  );
}
