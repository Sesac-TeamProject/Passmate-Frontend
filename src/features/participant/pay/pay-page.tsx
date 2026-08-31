import type { AvatarKey } from "@/components/common/student-avatar";
import type { PayMethod } from "@/lib/portone";
import { CoinChargeCard } from "./coin-charge-card";
import { ParticipantInfoCard } from "./participant-info-card";
import { PaymentCompleteCard, type PaymentReceipt } from "./payment-complete-card";
import { RoomInfoCard } from "./room-info-card";
import type { PaidRoom } from "./types";

export type PayFormValues = {
  nickname: string;
  avatar: AvatarKey;
  chargeAmount: number;
  payMethod: PayMethod;
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
};

/**
 * W-11 유료 방 입장 — 코인 결제. 좌 방 정보·참가자 정보 / 우 결제 카드(440).
 * 포트원 결제창(r1wqq)은 SDK가 띄우는 외부 UI라 그리지 않고, 완료(OYjYo)는 같은 화면의 done 단계.
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
}: Props) {
  if (step === "done" && receipt) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-9 py-7">
        <PaymentCompleteCard receipt={receipt} />
      </main>
    );
  }

  const paying = step === "paying";

  return (
    <main className="flex flex-col gap-5 px-9 py-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-heading-lg text-ink">유료 방 입장 — 코인 결제</h1>
        <p className="text-body-md text-muted-foreground">
          코인이 부족하면 포트원으로 충전한 뒤 자동 차감되고 바로 대기실로 들어가요 · 세션 시작
          전까지는 코인 100% 환급
        </p>
      </div>

      <div className="flex gap-5">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
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
          payMethod={values.payMethod}
          agreed={values.agreed}
          paying={paying}
          error={error}
          onChargeAmountChange={(chargeAmount) => onChange({ ...values, chargeAmount })}
          onPayMethodChange={(payMethod) => onChange({ ...values, payMethod })}
          onAgreedChange={(agreed) => onChange({ ...values, agreed })}
          onSubmit={onSubmit}
        />
      </div>
    </main>
  );
}
