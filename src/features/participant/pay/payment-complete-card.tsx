import { Check } from "lucide-react";
import Link from "next/link";
import { KeyValueRow } from "@/components/common/key-value-row";
import { Button } from "@/components/ui/button";
import { PAY_METHOD_LABEL, type PayMethod } from "@/lib/portone";
import { formatCoin, formatWon } from "./format";

export type PaymentReceipt = {
  paymentId: string;
  roomCode: string;
  roomTitle: string;
  /** 충전한 금액(원) */
  chargeAmount: number;
  payMethod: PayMethod;
  /** 차감된 코인 */
  deducted: number;
  /** 차감 후 남은 코인 */
  remaining: number;
};

type Props = { receipt: PaymentReceipt };

/** 결제 완료 카드(OYjYo) — 체크 원 · 제목 · 영수증 · 대기실 입장 CTA */
export function PaymentCompleteCard({ receipt }: Props) {
  return (
    <section className="flex w-[560px] max-w-full flex-col items-center gap-4 rounded-[20px] border bg-card p-10">
      <span
        aria-hidden
        className="flex size-[72px] items-center justify-center rounded-full bg-mint-bg"
      >
        <Check className="size-9 text-mint" strokeWidth={2} />
      </span>

      <h1 className="text-heading-lg text-ink">충전 · 차감이 완료됐어요</h1>
      <p className="text-body-md text-muted-foreground">
        대기실에서 선생님이 세션을 시작할 때까지 기다려 주세요
      </p>

      <div className="flex w-full flex-col gap-2.5 rounded-xl bg-muted px-4 py-3.5">
        <KeyValueRow label="방" value={receipt.roomTitle} />
        <KeyValueRow
          label="결제 · 차감"
          value={`${formatWon(receipt.chargeAmount)} 충전 (${PAY_METHOD_LABEL[receipt.payMethod]}) → ${formatCoin(receipt.deducted)} 차감`}
        />
        <KeyValueRow label="결제 번호" value={receipt.paymentId} />
        <KeyValueRow
          label="남은 코인"
          value={`${formatCoin(receipt.remaining)} · 세션 시작 전 취소 시 100% 환급`}
        />
      </div>

      <Button
        size="xl"
        className="h-[52px] w-full rounded-[14px]"
        render={<Link href={`/play/${receipt.roomCode}`} />}
      >
        대기실로 입장하기
      </Button>

      <p className="text-label-md text-ink-disabled">
        영수증은 마이페이지 › 참여한 방에서 다시 볼 수 있어요
      </p>
    </section>
  );
}
