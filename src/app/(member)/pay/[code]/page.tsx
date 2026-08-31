"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { avatarIdFromKey, avatarKeyFromId } from "@/components/common/student-avatar";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import {
  toPaidRoom,
  toPayErrorMessage,
  wireMethodFromPayMethod,
} from "@/features/participant/pay/adapt";
import type { PaymentReceipt } from "@/features/participant/pay/payment-complete-card";
import { PayPage, type PayFormValues, type PayStep } from "@/features/participant/pay/pay-page";
import { CHARGE_OPTIONS } from "@/features/participant/pay/types";
import { requestPayment } from "@/lib/portone";
import {
  useCoinBalance,
  useConfirmCharge,
  useCreateCharge,
  useEntryPayment,
} from "@/lib/queries/use-payments";
import { useMe } from "@/lib/queries/use-me";
import { useJoinRoom, useRoomByPin } from "@/lib/queries/use-rooms";

const INITIAL_VALUES: PayFormValues = {
  nickname: "",
  avatar: "cat",
  chargeAmount: CHARGE_OPTIONS[0],
  payMethod: "kakaopay",
  agreed: false,
};

/**
 * W-11 컨테이너 — 방 조회·코인 잔액·참가자 프로필 기본값을 쿼리로 소유하고,
 * 결제 버튼은 잔액이 충분하면 참가비만 차감, 부족하면 코인 충전(포트원)→확인→차감을 거쳐 대기실로 보낸다.
 */
export default function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code: pin } = use(params);
  const router = useRouter();

  const room = useRoomByPin(pin);
  const balanceQuery = useCoinBalance();
  const me = useMe();

  const roomId = room.data?.roomId ?? null;

  const createCharge = useCreateCharge();
  const confirmCharge = useConfirmCharge();
  const entryPayment = useEntryPayment(roomId ?? 0);
  const joinRoom = useJoinRoom(roomId);

  const [values, setValues] = useState<PayFormValues>(INITIAL_VALUES);
  const [defaultsApplied, setDefaultsApplied] = useState(false);
  const [chargeDefaultApplied, setChargeDefaultApplied] = useState(false);
  const [step, setStep] = useState<PayStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);

  const balance = balanceQuery.data?.balance ?? 0;
  const fee = room.data?.entryFee ?? 0;
  const shortfall = Math.max(0, fee - balance);

  // 참가자 기본값(닉네임·캐릭터) — 로그인 프로필이 오면 한 번만 채운다. 이미 입력을 시작했으면 덮어쓰지 않는다.
  // 렌더 중 조정(react.dev "Adjusting state when a prop changes") — effect 안에서 곧바로 setState하지 않는다.
  if (!defaultsApplied && me.data) {
    const profile = me.data;
    setDefaultsApplied(true);
    setValues((prev) =>
      prev.nickname === ""
        ? { ...prev, nickname: profile.nickname ?? "", avatar: avatarKeyFromId(profile.avatarId) }
        : prev,
    );
  }

  // 충전 금액 기본값 — 방·잔액이 오면 부족분 이상인 가장 작은 프리셋으로 한 번만 맞춘다.
  if (!chargeDefaultApplied && room.data && balanceQuery.data) {
    setChargeDefaultApplied(true);
    const preset =
      CHARGE_OPTIONS.find((amount) => amount >= shortfall) ??
      CHARGE_OPTIONS[CHARGE_OPTIONS.length - 1];
    setValues((prev) => ({ ...prev, chargeAmount: preset }));
  }

  // 무료 방은 결제가 필요 없다 — 대기실로 보낸다.
  useEffect(() => {
    if (room.data && !room.data.isPaid) router.replace(`/play/${pin}`);
  }, [room.data, pin, router]);

  if (room.isPending) return <ScreenLoading />;
  if (room.isError)
    return <ScreenError message={toPayErrorMessage(room.error)} onRetry={() => room.refetch()} />;
  // 무료 방 — 위 effect가 대기실로 보낸다. 그 사이 화면은 로딩으로만 보인다.
  if (!room.data.isPaid) return <ScreenLoading />;

  const paidRoom = toPaidRoom(room.data);

  const handleSubmit = async () => {
    if (!values.agreed || step === "paying" || roomId === null) return;
    setStep("paying");
    setError(null);

    const nickname = values.nickname;
    const avatarId = avatarIdFromKey(values.avatar);

    try {
      if (shortfall <= 0) {
        const entryRes = await entryPayment.mutateAsync({ nickname, avatarId });
        await joinRoom.mutateAsync({ nickname, avatarId });
        setReceipt({
          paymentId: entryRes.paymentNo ?? "",
          roomCode: pin,
          roomTitle: paidRoom.title,
          chargeAmount: 0,
          payMethod: values.payMethod,
          deducted: paidRoom.fee,
          remaining: entryRes.balance ?? balance,
        });
        setStep("done");
        return;
      }

      const checkout = await createCharge.mutateAsync({
        amount: values.chargeAmount,
        method: wireMethodFromPayMethod(values.payMethod),
        roomId,
      });

      const payResult = await requestPayment({
        orderName:
          checkout.orderName ?? `패스메이트 코인 ${values.chargeAmount.toLocaleString()} C 충전`,
        amount: checkout.amount ?? values.chargeAmount,
        payMethod: values.payMethod,
      });

      if (!payResult.ok) {
        setError(
          payResult.code === "CANCELLED"
            ? "결제가 취소됐어요 — 다시 시도해 주세요"
            : `결제에 실패했어요 — ${payResult.message}`,
        );
        setStep("idle");
        return;
      }

      const confirmRes = await confirmCharge.mutateAsync({
        chargeId: checkout.chargeId!,
        body: { paymentId: payResult.paymentId, roomId },
      });

      let paymentNo = confirmRes.entryPayment?.paymentNo;
      let remaining = confirmRes.entryPayment?.balance ?? confirmRes.balance ?? balance;

      // 확인 응답에 entryPayment가 없으면 참가비 차감이 아직 끝나지 않은 것 — 이어서 차감한다.
      if (!confirmRes.entryPayment) {
        const entryRes = await entryPayment.mutateAsync({ nickname, avatarId });
        paymentNo = entryRes.paymentNo;
        remaining = entryRes.balance ?? remaining;
      }

      await joinRoom.mutateAsync({ nickname, avatarId });

      setReceipt({
        paymentId: paymentNo ?? payResult.paymentId,
        roomCode: pin,
        roomTitle: paidRoom.title,
        chargeAmount: values.chargeAmount,
        payMethod: values.payMethod,
        deducted: paidRoom.fee,
        remaining,
      });
      setStep("done");
    } catch (err) {
      setError(toPayErrorMessage(err));
      setStep("idle");
    }
  };

  return (
    <PayPage
      room={paidRoom}
      balance={balance}
      chargeOptions={CHARGE_OPTIONS}
      values={values}
      step={step}
      error={error}
      receipt={receipt}
      onChange={setValues}
      onSubmit={handleSubmit}
    />
  );
}
