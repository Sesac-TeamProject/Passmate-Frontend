"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginPage, type LoginValues } from "@/features/auth/login-page";

const INITIAL_VALUES: LoginValues = { email: "", password: "", remember: false };

/** C-01 v2 컨테이너. 폼 상태·제출을 소유하고 렌더는 LoginPage에 맡긴다. */
export default function Page() {
  const router = useRouter();
  const [values, setValues] = useState<LoginValues>(INITIAL_VALUES);
  const [pending, setPending] = useState(false);

  const handleSubmit = () => {
    // TODO(API): 이메일 로그인 계약 없음 — lib/api/auth.ts 연동 후 auth-store 갱신
    setPending(true);
    router.push("/home");
  };

  return (
    <LoginPage values={values} onChange={setValues} onSubmit={handleSubmit} pending={pending} />
  );
}
