"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toAvatarKey } from "@/components/common/student-avatar";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import {
  toPaidRoom,
  toPayErrorMessage,
  wireMethodFromPayMethod,
} from "@/features/participant/pay/adapt";
import type { PaymentReceipt } from "@/features/participant/pay/payment-complete-card";
import { PayFailed } from "@/features/participant/pay/pay-failed";
import { PayPage, type PayFormValues, type PayStep } from "@/features/participant/pay/pay-page";
import { CHARGE_OPTIONS } from "@/features/participant/pay/types";
import {
  clearPendingPayment,
  readPendingPayment,
  writePendingPayment,
  type PendingPayment,
} from "@/lib/pending-payment";
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

  const roomId = room.data?.id ?? null;

  const createCharge = useCreateCharge();
  const confirmCharge = useConfirmCharge();
  const entryPayment = useEntryPayment(roomId ?? 0);
  const joinRoom = useJoinRoom(roomId);

  const [values, setValues] = useState<PayFormValues>(INITIAL_VALUES);
  const [defaultsApplied, setDefaultsApplied] = useState(false);
  const [chargeDefaultApplied, setChargeDefaultApplied] = useState(false);
  const [step, setStep] = useState<PayStep>("idle");
  const [error, setError] = useState<string | null>(null);
  // W-11e 전체 화면으로 알릴 실패. 사용자가 스스로 취소한 건 여기 담지 않는다(폼 위 한 줄로 남긴다).
  const [failure, setFailure] = useState<{ message: string; amount: number } | null>(null);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  // 참가비 차감이 끝난 방을 기억한다 — joinRoom만 실패한 재시도가 참가비를 다시 차감하지 않도록.
  const [paidReceipt, setPaidReceipt] = useState<{
    roomId: number;
    paymentNo?: string;
    balance?: number;
    chargeAmount: number;
    payMethod: PayFormValues["payMethod"];
  } | null>(null);
  // 위 state는 새로고침하면 사라진다 — 단계별 진행 상태는 sessionStorage에도 남겨 재시도가 이미 낸 돈을 또 내지 않게 한다.
  const [pending, setPending] = useState<PendingPayment | null>(null);
  const [pendingLoaded, setPendingLoaded] = useState(false);

  const balance = balanceQuery.data?.balance ?? 0;
  const fee = room.data?.fee ?? 0;
  const shortfall = Math.max(0, fee - balance);

  // 참가자 기본값(닉네임·캐릭터) — 로그인 프로필이 오면 한 번만 채운다. 이미 입력을 시작했으면 덮어쓰지 않는다.
  // 렌더 중 조정(react.dev "Adjusting state when a prop changes") — effect 안에서 곧바로 setState하지 않는다.
  if (!defaultsApplied && me.data) {
    const profile = me.data;
    setDefaultsApplied(true);
    setValues((prev) =>
      prev.nickname === ""
        ? { ...prev, nickname: profile.nickname, avatar: toAvatarKey(profile.defaultAvatarId) }
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

  // 직전 시도가 남긴 결제 진행 상태 — 방 id가 정해지면 한 번만 읽는다(화면 출력에는 쓰지 않아 SSR과 어긋나지 않는다).
  if (!pendingLoaded && roomId !== null) {
    setPendingLoaded(true);
    setPending(readPendingPayment(roomId));
  }

  // 무료 방은 결제가 필요 없다 — 대기실로 보낸다.
  useEffect(() => {
    if (room.data && room.data.guestAllowed) router.replace(`/play/${pin}`);
  }, [room.data, pin, router]);

  if (room.isPending) return <ScreenLoading />;
  if (room.isError)
    return <ScreenError message={toPayErrorMessage(room.error)} onRetry={() => room.refetch()} />;
  // 무료 방 — 위 effect가 대기실로 보낸다. 그 사이 화면은 로딩으로만 보인다.
  if (room.data.guestAllowed) return <ScreenLoading />;

  const paidRoom = toPaidRoom(room.data, pin);

  /** 단계 진행 상태를 sessionStorage와 화면 state에 함께 남긴다. */
  const savePending = (next: PendingPayment) => {
    writePendingPayment(next);
    setPending(next);
  };

  const forgetPending = (id: number) => {
    clearPendingPayment(id);
    setPending(null);
  };

  const handleSubmit = async () => {
    if (!values.agreed || step === "paying" || roomId === null) return;
    setStep("paying");
    setError(null);
    setFailure(null);

    const nickname = values.nickname;
    const avatarId = values.avatar;
    const saved = pending?.roomId === roomId ? pending : null;
    const paid = paidReceipt?.roomId === roomId ? paidReceipt : null;

    try {
      // 이미 이 방의 참가비를 냈다(직전 시도가 joinRoom에서만 실패, 또는 새로고침) — 다시 차감하지 않고 입장만 재시도한다.
      if (paid || saved?.entryPaid) {
        await joinRoom.mutateAsync({ nickname, avatarId });
        forgetPending(roomId);
        setReceipt({
          paymentId: paid?.paymentNo ?? "",
          roomCode: pin,
          roomTitle: paidRoom.title,
          chargeAmount: paid?.chargeAmount ?? 0,
          payMethod: paid?.payMethod ?? values.payMethod,
          deducted: paidRoom.fee,
          remaining: paid?.balance ?? balance,
        });
        setStep("done");
        return;
      }

      if (shortfall <= 0 && !saved?.chargeId) {
        const entryRes = await entryPayment.mutateAsync({ nickname, avatarId });
        savePending({ roomId, entryPaid: true });
        setPaidReceipt({
          roomId,
          paymentNo: entryRes.paymentNo,
          balance: entryRes.balance,
          chargeAmount: 0,
          payMethod: values.payMethod,
        });
        await joinRoom.mutateAsync({ nickname, avatarId });
        forgetPending(roomId);
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

      // 아래 세 단계는 각각 성공 즉시 기록한다 — 뒤 단계가 실패한 재시도가 앞 단계를 다시 밟지 않도록.
      let chargeId = saved?.chargeId ?? null;
      let paymentId = saved?.paymentId ?? null;
      let chargeAmount = values.chargeAmount;
      let orderName = `패스메이트 코인 ${values.chargeAmount.toLocaleString()} C 충전`;

      if (chargeId === null) {
        const checkout = await createCharge.mutateAsync({
          amount: values.chargeAmount,
          method: wireMethodFromPayMethod(values.payMethod),
          roomId,
        });

        if (!checkout.chargeId) {
          setError("충전 준비에 실패했어요. 다시 시도해 주세요");
          setStep("idle");
          return;
        }

        chargeId = checkout.chargeId;
        chargeAmount = checkout.amount ?? values.chargeAmount;
        orderName = checkout.orderName ?? orderName;
        savePending({ roomId, chargeId, entryPaid: false });
      }

      if (paymentId === null) {
        const payResult = await requestPayment({
          orderName,
          amount: chargeAmount,
          payMethod: values.payMethod,
        });

        if (!payResult.ok) {
          // 취소는 되돌아온 것이지 실패가 아니다 — 화면을 갈아 끼우지 않고 폼 위에 한 줄만 남긴다.
          if (payResult.code === "CANCELLED") {
            setError("결제가 취소됐어요 — 다시 시도해 주세요");
          } else {
            setFailure({ message: payResult.message, amount: chargeAmount });
          }
          setStep("idle");
          return;
        }

        paymentId = payResult.paymentId;
        savePending({ roomId, chargeId, paymentId, entryPaid: false });
      }

      const confirmRes = await confirmCharge.mutateAsync({
        chargeId,
        body: { paymentId, roomId },
      });

      let paymentNo = confirmRes.entryPayment?.paymentNo;
      let remaining = confirmRes.entryPayment?.balance ?? confirmRes.balance ?? balance;

      // 확인 응답에 entryPayment가 없으면 참가비 차감이 아직 끝나지 않은 것 — 이어서 차감한다.
      if (!confirmRes.entryPayment) {
        const entryRes = await entryPayment.mutateAsync({ nickname, avatarId });
        paymentNo = entryRes.paymentNo;
        remaining = entryRes.balance ?? remaining;
      }

      // 참가비 차감이 끝났다 — joinRoom이 실패해도 재시도가 다시 차감하지 않도록 방 단위로 기억해 둔다.
      savePending({ roomId, chargeId, paymentId, entryPaid: true });
      setPaidReceipt({
        roomId,
        paymentNo,
        balance: remaining,
        chargeAmount,
        payMethod: values.payMethod,
      });

      await joinRoom.mutateAsync({ nickname, avatarId });
      forgetPending(roomId);

      setReceipt({
        paymentId: paymentNo ?? paymentId,
        roomCode: pin,
        roomTitle: paidRoom.title,
        chargeAmount,
        payMethod: values.payMethod,
        deducted: paidRoom.fee,
        remaining,
      });
      setStep("done");
    } catch (err) {
      setFailure({
        message: toPayErrorMessage(err),
        amount: shortfall > 0 ? values.chargeAmount : paidRoom.fee,
      });
      setStep("idle");
    }
  };

  if (failure)
    return (
      <PayFailed
        message={failure.message}
        amount={failure.amount}
        payMethod={values.payMethod}
        onRetry={handleSubmit}
        onChangeMethod={() => setFailure(null)}
        retrying={step === "paying"}
      />
    );

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
