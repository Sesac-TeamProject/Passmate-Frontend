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
    // TODO(API): PATCH /me/password — 검증(8자 이상·영문+숫자·확인 일치) 문구는 시안 없음
    router.push("/me");
  };

  return <PasswordPage values={values} onChange={setValues} onSubmit={handleSubmit} />;
}
