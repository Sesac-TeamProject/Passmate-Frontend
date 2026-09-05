"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import {
  toCoinSummary,
  toProfile,
  toSettlementAccount,
  toSettlementSummary,
} from "@/features/me/adapt";
import { MyPage } from "@/features/me/my-page";
import { useLogout } from "@/lib/queries/use-auth";
import { useGrade, useMe } from "@/lib/queries/use-me";
import { useCoinBalance, useEarnings, useSettlementAccount } from "@/lib/queries/use-payments";
import { AppError } from "@/lib/types/app-error";

/** C-02 v3 컨테이너 — 로그아웃 확인 다이얼로그(C-02-11) 상태를 소유한다 */
export default function Page() {
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const logout = useLogout();

  const me = useMe();
  // 이름 옆 등급 뱃지(시안 C-02). 등급은 /users/me가 아니라 따로 준다 —
  // 이 조회가 늦거나 실패해도 나머지는 그대로 보여야 하므로 로딩·에러 게이트에 넣지 않는다.
  const grade = useGrade();
  const coins = useCoinBalance();
  const earnings = useEarnings();
  // 정산 계좌는 화면에 은행 · 마스킹 번호 요약만 필요해 이 컨테이너에서도 함께 조회한다(retry:false — 미등록은 404)
  const account = useSettlementAccount();

  const handleLogout = () => {
    if (logout.isPending) return;
    logout.mutate(undefined, {
      onSettled: () => {
        setLogoutOpen(false);
        router.replace("/login");
      },
    });
  };

  const isAccountNotRegistered =
    account.isError && AppError.isAppError(account.error) && account.error.kind === "NotFound";

  if (me.isPending || coins.isPending || earnings.isPending || account.isPending)
    return <ScreenLoading />;
  if (me.isError) return <ScreenError message={me.error.message} onRetry={() => me.refetch()} />;
  if (coins.isError)
    return <ScreenError message={coins.error.message} onRetry={() => coins.refetch()} />;
  if (earnings.isError)
    return <ScreenError message={earnings.error.message} onRetry={() => earnings.refetch()} />;
  if (account.isError && !isAccountNotRegistered)
    return <ScreenError message={account.error.message} onRetry={() => account.refetch()} />;

  return (
    <>
      <MyPage
        profile={toProfile(me.data, grade.data)}
        joinedRooms={me.data.stats.joinedRoomCount}
        hostedRooms={me.data.stats.hostedRoomCount}
        coinSummary={toCoinSummary(coins.data)}
        settlementSummary={toSettlementSummary(earnings.data)}
        settlementAccount={account.isSuccess ? toSettlementAccount(account.data) : null}
        onLogout={() => setLogoutOpen(true)}
      />
      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="로그아웃 할까요?"
        description="다시 로그인하면 기록과 코인은 그대로 있어요."
        confirmLabel="로그아웃"
        pending={logout.isPending}
        onConfirm={handleLogout}
      />
    </>
  );
}
