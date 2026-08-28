"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { MyPage } from "@/features/me/my-page";

/** C-02 v3 컨테이너 — 로그아웃 확인 다이얼로그(C-02-11) 상태를 소유한다 */
export default function Page() {
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = () => {
    // TODO(API): POST /auth/logout → auth-store 초기화
    setLogoutOpen(false);
    router.push("/login");
  };

  return (
    <>
      <MyPage onLogout={() => setLogoutOpen(true)} />
      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="로그아웃 할까요?"
        description="다시 로그인하면 기록과 코인은 그대로 있어요."
        confirmLabel="로그아웃"
        onConfirm={handleLogout}
      />
    </>
  );
}
