"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toAvatarKey } from "@/components/common/student-avatar";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import {
  toPaidRoom,
  toPayErrorMessage,
  toPayGate,
  wireMethodFromPayMethod,
} from "@/features/participant/pay/adapt";
import type { PaymentReceipt } from "@/features/participant/pay/payment-complete-card";
import { PayFailed } from "@/features/participant/pay/pay-failed";
import { PayPage, type PayFormValues, type PayStep } from "@/features/participant/pay/pay-page";
import { CHARGE_OPTIONS } from "@/features/participant/pay/types";
import { isErrorCode, toInsufficientCoins } from "@/features/participant/pay/payment-errors";
import {
  clearPendingPayment,
  readPendingPayment,
  writePendingPayment,
  type PendingPayment,
} from "@/lib/pending-payment";
import { requestPayment } from "@/lib/portone";
import { ERROR_CODES } from "@/lib/types/error-codes";
import {
  useCoinBalance,
  useConfirmCharge,
  useCreateCharge,
  useEntryPayment,
} from "@/lib/queries/use-payments";
import { useMe } from "@/lib/queries/use-me";
import { useJoinRoom, useRoom } from "@/lib/queries/use-rooms";

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
export default function Page({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId: roomIdParam } = use(params);
  const router = useRouter();

  // 공개 방 목록에 PIN이 없어 카드가 방 id만 준다 — 결제 화면은 id로 연다(F-1).
  // 주소가 방 id 모양이 아니면 null로 두고 아래에서 안내로 끝낸다.
  const parsedRoomId = Number(roomIdParam);
  const roomId = Number.isSafeInteger(parsedRoomId) && parsedRoomId > 0 ? parsedRoomId : null;
  const room = useRoom(roomId);
  const balanceQuery = useCoinBalance();
  const me = useMe();

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
    paymentNo: string;
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

  // 결제할 게 없는 무료 방은 대기실로 보낸다. 입장은 PIN으로 하고, 그 PIN은 방 조회가 실어 준다.
  const gate = room.data ? toPayGate(room.data) : null;
  useEffect(() => {
    if (room.data && gate === "free") router.replace(`/play/${room.data.pin}`);
  }, [room.data, gate, router]);

  // 주소가 방 id 모양이 아니다 — 쿼리를 걸지 않았으니 로딩으로 두면 영영 돌기만 한다.
  if (roomId === null) return <ScreenError message="없는 방이에요" />;
  if (room.isPending) return <ScreenLoading />;
  if (room.isError)
    return <ScreenError message={toPayErrorMessage(room.error)} onRetry={() => room.refetch()} />;
  // PIN 조회와 달리 id 조회는 끝난 방도 200으로 준다 — 결제 폼 대신 안내로 끝낸다.
  if (gate === "closed") return <ScreenError message="이미 끝난 방이에요" />;
  // 무료 방 — 위 effect가 대기실로 보낸다. 그 사이 화면은 로딩으로만 보인다.
  if (gate !== "payable") return <ScreenLoading />;

  const paidRoom = toPaidRoom(room.data);

  /** 단계 진행 상태를 sessionStorage와 화면 state에 함께 남긴다. */
  const savePending = (next: PendingPayment) => {
    writePendingPayment(next);
    setPending(next);
  };

  const forgetPending = (id: number) => {
    clearPendingPayment(id);
    setPending(null);
  };

  /**
   * 402가 실어 준 부족분으로 충전 프리셋을 다시 고른다 — 잔액을 다시 조회하지 않는다.
   * 잔액 쿼리가 낡아 "충분한 줄 알고" 참가비부터 부른 경우가 여기로 온다.
   */
  const chargePresetFor = (shortfallCoins: number) =>
    CHARGE_OPTIONS.find((amount) => amount >= shortfallCoins) ??
    CHARGE_OPTIONS[CHARGE_OPTIONS.length - 1];

  const handleSubmit = async () => {
    if (!values.agreed || step === "paying" || roomId === null) return;
    setStep("paying");
    setError(null);
    setFailure(null);

    const nickname = values.nickname;
    const avatarId = values.avatar;
    const saved = pending?.roomId === roomId ? pending : null;
    const paid = paidReceipt?.roomId === roomId ? paidReceipt : null;

    /** 참가비까지 끝난 상태에서 입장만 마치고 영수증을 그린다 */
    const finish = async (receiptValues: {
      paymentNo: string;
      chargeAmount: number;
      remaining: number;
    }) => {
      await joinRoom.mutateAsync({ nickname, avatarId });
      forgetPending(roomId);
      setReceipt({
        paymentId: receiptValues.paymentNo,
        roomCode: paidRoom.code,
        roomTitle: paidRoom.title,
        chargeAmount: receiptValues.chargeAmount,
        payMethod: values.payMethod,
        deducted: paidRoom.fee,
        remaining: receiptValues.remaining,
      });
      setStep("done");
    };

    try {
      // 이미 이 방의 참가비를 냈다(직전 시도가 joinRoom에서만 실패, 또는 새로고침) — 다시 차감하지 않는다.
      if (paid || saved?.entryPaid) {
        await finish({
          paymentNo: paid?.paymentNo ?? "",
          chargeAmount: paid?.chargeAmount ?? 0,
          remaining: paid?.balance ?? balance,
        });
        return;
      }

      // 잔액이 충분해 보이면 충전 없이 참가비만 낸다. 서버가 402로 되받으면 아래 충전 경로로 넘어간다.
      if (shortfall <= 0 && !saved?.chargeId) {
        try {
          const entryRes = await entryPayment.mutateAsync();
          savePending({ roomId, entryPaid: true });
          setPaidReceipt({
            roomId,
            paymentNo: entryRes.paymentNo,
            balance: entryRes.balanceAfter,
            chargeAmount: 0,
            payMethod: values.payMethod,
          });
          await finish({
            paymentNo: entryRes.paymentNo,
            chargeAmount: 0,
            remaining: entryRes.balanceAfter,
          });
          return;
        } catch (err) {
          // 같은 방에 살아 있는 결제가 이미 있다 — 결제를 건너뛰고 바로 입장한다.
          if (isErrorCode(err, ERROR_CODES.ALREADY_PAID)) {
            savePending({ roomId, entryPaid: true });
            await finish({ paymentNo: "", chargeAmount: 0, remaining: balance });
            return;
          }
          // 잔액이 실제로는 모자랐다 — 서버가 알려준 부족분만큼 충전 화면으로 되돌린다.
          const short = toInsufficientCoins(err);
          if (!short) throw err;
          setValues((prev) => ({ ...prev, chargeAmount: chargePresetFor(short.shortfall) }));
          setError("코인이 모자라요. 충전 금액을 확인하고 다시 눌러 주세요");
          setStep("idle");
          return;
        }
      }

      // 아래 두 단계는 각각 성공 즉시 기록한다 — 뒤 단계가 실패한 재시도가 앞 단계를 다시 밟지 않도록.
      let chargeId = saved?.chargeId ?? null;
      let paymentId = saved?.paymentId ?? null;
      let chargeAmount = values.chargeAmount;

      if (chargeId === null || paymentId === null) {
        // roomId를 실어 보내면 confirm 한 번이 충전 + 참가비 차감까지 끝낸다.
        const charge = await createCharge.mutateAsync({
          amount: values.chargeAmount,
          method: wireMethodFromPayMethod(values.payMethod),
          roomId,
        });

        chargeId = charge.chargeId;
        chargeAmount = charge.amount;
        savePending({ roomId, chargeId, entryPaid: false });

        const payResult = await requestPayment(charge, wireMethodFromPayMethod(values.payMethod));

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

      // 결제창이 성공으로 닫혀도 이 시점엔 코인이 아직 안 늘었다 — confirm이 적립한다(멱등).
      const confirmRes = await confirmCharge.mutateAsync(chargeId);

      let paymentNo = confirmRes.entryPayment?.paymentNo ?? "";
      let remaining = confirmRes.entryPayment?.balanceAfter ?? confirmRes.balanceAfter;

      // 확인 응답에 entryPayment가 없으면 참가비 차감이 아직 안 끝난 것 — 이어서 차감한다.
      if (!confirmRes.entryPayment) {
        const entryRes = await entryPayment.mutateAsync();
        paymentNo = entryRes.paymentNo;
        remaining = entryRes.balanceAfter;
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

      await finish({ paymentNo, chargeAmount, remaining });
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
