import { ArrowLeft } from "lucide-react";
import { Mascot } from "@/components/common/mascot";
import type { AvatarKey } from "@/components/common/student-avatar";
import { CoinChargeCard } from "./coin-charge-card";
import { ParticipantInfoCard } from "./participant-info-card";
import { PaymentCompleteCard, type PaymentReceipt } from "./payment-complete-card";
import { RoomInfoCard } from "./room-info-card";
import type { PaidRoom } from "./types";

export type PayFormValues = {
  nickname: string;
  avatar: AvatarKey;
  chargeAmount: number;
  agreed: boolean;
};

export type PayStep = "idle" | "paying" | "done";

type Props = {
  room: PaidRoom;
  balance: number;
  chargeOptions: readonly number[];
  values: PayFormValues;
  step: PayStep;
  error?: string | null;
  /** step === "done"일 때의 영수증 */
  receipt?: PaymentReceipt | null;
  onChange: (values: PayFormValues) => void;
  onSubmit: () => void;
  /** 폰 폭 머리의 ← (앱 M-11). 없으면 화살표를 그리지 않는다 */
  onBack?: () => void;
};

/**
 * W-11 유료 방 입장 — 코인 결제. 좌 방 정보·참가자 정보 / 우 결제 카드(440).
 * 포트원 결제창(r1wqq)은 SDK가 띄우는 외부 UI라 그리지 않고, 완료(OYjYo)는 같은 화면의 done 단계.
 *
 * 폰 폭(768px 미만)은 앱 시안 M-11 — ← "유료 방 입장" 머리와 마스코트, 카드는 한 단으로 쌓는다.
 * 앱의 결제 수단 고르기(카카오페이 등)는 웹이 포트원 결제창에 맡기므로 그리지 않고 코인 결제 흐름을 그대로 쓴다.
 */
export function PayPage({
  room,
  balance,
  chargeOptions,
  values,
  step,
  error,
  receipt,
  onChange,
  onSubmit,
  onBack,
}: Props) {
  if (step === "done" && receipt) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-9 py-7 max-md:min-h-dvh max-md:bg-card max-md:px-5">
        <PaymentCompleteCard receipt={receipt} />
      </main>
    );
  }

  const paying = step === "paying";

  return (
    <main className="flex flex-col gap-5 px-9 py-7 max-md:min-h-dvh max-md:gap-4 max-md:bg-card max-md:px-5 max-md:pt-0 max-md:pb-8">
      <div className="flex flex-col gap-1 max-md:hidden">
        <h1 className="text-heading-lg text-ink">유료 방 입장 — 코인 결제</h1>
        <p className="text-body-md text-muted-foreground">
          코인이 부족하면 포트원으로 충전한 뒤 자동 차감되고 바로 대기실로 들어가요 · 세션 시작
          전까지는 코인 100% 환급
        </p>
      </div>

      {/* 폰 폭 머리 — 앱 M-11 */}
      <header className="relative flex items-start gap-3 pt-16 pb-4 md:hidden">
        {onBack ? (
          <button type="button" onClick={onBack} aria-label="뒤로" className="-m-1 mt-0.5 p-1">
            <ArrowLeft className="size-6 text-ink" strokeWidth={2} aria-hidden />
          </button>
        ) : null}
        <div className="flex min-w-0 flex-col gap-1.5 pr-20">
          <h1 className="text-heading-lg text-mint-dark">유료 방 입장</h1>
          <p className="text-label-lg text-muted-foreground">
            유료 방이에요 — 결제 후 입장할 수 있어요
          </p>
        </div>
        <Mascot variant="phone" className="absolute top-11 right-2 h-[75px] w-[68px]" />
      </header>

      <div className="flex gap-5 max-md:flex-col max-md:gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-5 max-md:gap-4">
          <RoomInfoCard room={room} />
          <ParticipantInfoCard
            nickname={values.nickname}
            avatar={values.avatar}
            onNicknameChange={(nickname) => onChange({ ...values, nickname })}
            onAvatarChange={(avatar) => onChange({ ...values, avatar })}
            disabled={paying}
          />
        </div>

        <CoinChargeCard
          balance={balance}
          fee={room.fee}
          chargeOptions={chargeOptions}
          chargeAmount={values.chargeAmount}
          agreed={values.agreed}
          paying={paying}
          error={error}
          onChargeAmountChange={(chargeAmount) => onChange({ ...values, chargeAmount })}
          onAgreedChange={(agreed) => onChange({ ...values, agreed })}
          onSubmit={onSubmit}
        />
      </div>
    </main>
  );
}
