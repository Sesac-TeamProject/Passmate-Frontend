"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INITIAL_JOIN_VALUES, type JoinValues } from "@/features/participant/join/join-form";
import { JoinPage } from "@/features/participant/join/join-page";

/** C-03 게스트 입장 컨테이너. PIN·닉네임·캐릭터 상태를 소유하고 렌더는 JoinPage에 맡긴다. */
export default function Page() {
  const router = useRouter();
  const [values, setValues] = useState<JoinValues>(INITIAL_JOIN_VALUES);
  const [pending, setPending] = useState(false);

  const handleSubmit = () => {
    // TODO(API): 게스트 입장 계약 없음 — PIN 검증·닉네임·아바타 등록 후 방으로 이동
    setPending(true);
    router.push(`/play/${values.pin}`);
  };

  return (
    <JoinPage values={values} onChange={setValues} onSubmit={handleSubmit} pending={pending} />
  );
}
