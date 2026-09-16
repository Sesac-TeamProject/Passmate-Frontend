import { Check } from "lucide-react";
import { MOBILE_PRIMARY_BUTTON, MobileActionBar } from "@/components/common/mobile-action-bar";
import { Button } from "@/components/ui/button";
import { MeFormPage } from "@/features/me/settings/me-form-page";
import { formatKrwInline, formatNumber } from "@/lib/format";
import { PAY_METHOD_LABEL, type PayMethod } from "@/lib/portone";

type Props = {
  /** 충전한 코인(= 결제 금액, 1 C = ₩1) */
  amount: number;
  /** 실제로 쓴 수단(서버가 포트원 조회로 기록). 못 알아낸 결제는 null — 표기를 생략한다 */
  payMethod: PayMethod | null;
  /** 충전 후 보유 코인 */
  balanceAfter: number;
  onConfirm: () => void;
};

/** C-02-6 코인 충전 완료 — 민트 체크 원 72 · 충전량 · 잔액/수단 · 안내 · 확인 */
export function ChargeCompletePage({ amount, payMethod, balanceAfter, onConfirm }: Props) {
  return (
    <MeFormPage
      title="코인 충전"
      cardClassName="items-center gap-3 px-7 py-12"
      // 코인 내역에서 들어오는 화면이라 뒤로가기는 마이가 아니라 코인 내역으로 돌아간다
      backHref="/me/coins"
      mobileAction={
        <MobileActionBar aboveTabBar className="-mx-5">
          <button type="button" onClick={onConfirm} className={MOBILE_PRIMARY_BUTTON}>
            확인
          </button>
        </MobileActionBar>
      }
    >
      <div className="flex size-[72px] items-center justify-center rounded-full bg-mint">
        <Check className="size-8 text-white" strokeWidth={2} aria-hidden />
      </div>
      <h2 className="text-heading-lg text-foreground">{formatNumber(amount)} C 충전 완료</h2>
      <p className="text-body-md text-muted-foreground">
        보유 코인 {formatNumber(balanceAfter)} C ·{" "}
        {payMethod ? PAY_METHOD_LABEL[payMethod] : "포트원 결제"} {formatKrwInline(amount)}
      </p>
      <p className="text-label-md text-ink-disabled">
        결제 내역은 마이페이지 › 코인 · 결제에서 볼 수 있어요
      </p>
      <Button size="xl" className="mt-2 max-md:hidden" onClick={onConfirm}>
        확인
      </Button>
    </MeFormPage>
  );
}
