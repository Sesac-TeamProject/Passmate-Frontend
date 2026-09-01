"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PAID_ROOM_LOGIN_MESSAGE, toJoinErrorMessage } from "@/features/participant/join/adapt";
import { INITIAL_JOIN_VALUES, type JoinValues } from "@/features/participant/join/join-form";
import { JoinPage } from "@/features/participant/join/join-page";
import { useJoinByPin } from "@/lib/queries/use-rooms";
import { useAuthStore } from "@/lib/stores/auth-store";

/** C-03 게스트 입장 컨테이너. PIN·닉네임·캐릭터 상태를 소유하고 렌더는 JoinPage에 맡긴다. */
export default function Page() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const [values, setValues] = useState<JoinValues>(INITIAL_JOIN_VALUES);
  const [paidGuestPin, setPaidGuestPin] = useState<string | null>(null);
  const join = useJoinByPin();

  const handleSubmit = () => {
    setPaidGuestPin(null);
    join.mutate(
      {
        pin: values.pin,
        body: { nickname: values.nickname, avatarId: values.avatar },
      },
      {
        onSuccess: (data) => {
          if (data.kind === "joined") {
            router.push(`/play/${values.pin}`);
            return;
          }
          // 유료 방 — 회원은 결제로, 게스트는 화면에 로그인 안내
          if (status === "authenticated") {
            router.push(`/pay/${values.pin}`);
          } else {
            setPaidGuestPin(values.pin);
          }
        },
      },
    );
  };

  const errorMessage = join.isPending
    ? null
    : paidGuestPin
      ? PAID_ROOM_LOGIN_MESSAGE
      : join.isError
        ? toJoinErrorMessage(join.error)
        : null;

  return (
    <JoinPage
      values={values}
      onChange={setValues}
      onSubmit={handleSubmit}
      pending={join.isPending}
      errorMessage={errorMessage}
      loginHref={paidGuestPin ? `/login?next=${encodeURIComponent(`/pay/${paidGuestPin}`)}` : null}
    />
  );
}
