"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PROFILE } from "@/features/me/mock";
import { AccountPage, type AccountValues } from "@/features/me/settings/account-page";

/** C-02-1 컨테이너 — 닉네임 폼 상태를 소유하고 렌더는 AccountPage에 맡긴다 */
export default function Page() {
  const router = useRouter();
  const [values, setValues] = useState<AccountValues>({ nickname: PROFILE.nickname });

  const handleSubmit = () => {
    // TODO(API): PATCH /me { nickname } → auth-store 갱신
    router.push("/me");
  };

  return (
    <AccountPage
      avatar={PROFILE.avatar}
      email={PROFILE.email}
      values={values}
      onChange={setValues}
      onSubmit={handleSubmit}
    />
  );
}
