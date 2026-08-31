"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PasswordPage, type PasswordValues } from "@/features/me/settings/password-page";

const INITIAL_VALUES: PasswordValues = { current: "", next: "", confirm: "" };

/** C-02-2 컨테이너 — 비밀번호 폼 상태를 소유한다 */
export default function Page() {
  const router = useRouter();
  const [values, setValues] = useState<PasswordValues>(INITIAL_VALUES);

  const handleSubmit = () => {
    // TODO(API): 비밀번호 변경 계약 없음 — DESIGN_GAPS C-1/D-11 (Google 로그인 전용이라 비밀번호 자체가 없을 수 있다)
    router.push("/me");
  };

  return <PasswordPage values={values} onChange={setValues} onSubmit={handleSubmit} />;
}
