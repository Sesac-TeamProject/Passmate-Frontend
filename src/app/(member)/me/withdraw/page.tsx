"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COIN_BALANCE } from "@/features/me/coins/mock";
import { WithdrawPage } from "@/features/me/withdraw/withdraw-page";

/** C-02-12 컨테이너. 확인 체크·탈퇴 요청을 소유한다. */
export default function Page() {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);
  const [pending, setPending] = useState(false);

  const handleWithdraw = () => {
    // TODO(API): 회원 탈퇴 계약 없음 — lib/api 연동 후 auth-store clear. 정산 예정 금액이 있으면 서버 code 기준으로 막는다
    setPending(true);
    router.push("/login");
  };

  return (
    <WithdrawPage
      balance={COIN_BALANCE}
      confirmed={confirmed}
      onConfirmedChange={setConfirmed}
      pending={pending}
      onWithdraw={handleWithdraw}
    />
  );
}
