"use client";

import { useState } from "react";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toMeErrorMessage } from "@/features/me/adapt";
import { WithdrawPage } from "@/features/me/withdraw/withdraw-page";
import { useLogout } from "@/lib/queries/use-auth";
import { useDeleteMe } from "@/lib/queries/use-me";
import { useCoinBalance } from "@/lib/queries/use-payments";

/** C-02-12 컨테이너. 확인 체크·탈퇴 요청을 소유한다. */
export default function Page() {
  const balance = useCoinBalance();
  const deleteMe = useDeleteMe();
  const logout = useLogout();
  const [confirmed, setConfirmed] = useState(false);

  const handleWithdraw = () => {
    if (deleteMe.isPending) return;
    deleteMe.mutate(undefined, {
      onSuccess: () => {
        // 탈퇴 뒤에도 도착지는 랜딩 — `useLogout`이 문서 이동으로 데려간다
        logout.mutate();
      },
    });
  };

  if (balance.isPending) return <ScreenLoading />;
  if (balance.isError)
    return <ScreenError message={balance.error.message} onRetry={() => balance.refetch()} />;

  return (
    <WithdrawPage
      balance={balance.data.balance ?? 0}
      confirmed={confirmed}
      onConfirmedChange={setConfirmed}
      pending={deleteMe.isPending || logout.isPending}
      onWithdraw={handleWithdraw}
      errorMessage={deleteMe.isError ? toMeErrorMessage(deleteMe.error) : null}
    />
  );
}
