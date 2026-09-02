"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScreenLoading } from "@/components/common/screen-loading";
import {
  PAID_ROOM_LOGIN_MESSAGE,
  toJoinErrorMessage,
  toRoomPreview,
} from "@/features/participant/join/adapt";
import { INITIAL_JOIN_VALUES, type JoinValues } from "@/features/participant/join/join-form";
import { JoinPage } from "@/features/participant/join/join-page";
import { PIN_LENGTH } from "@/features/participant/join/pin-input";
import { useJoinRoom, useNicknameCheck, useRoomByPin } from "@/lib/queries/use-rooms";
import { useAuthStore } from "@/lib/stores/auth-store";

/** 닉네임을 글자마다 확인하지 않도록 기다리는 시간 */
const NICKNAME_DEBOUNCE_MS = 400;

/**
 * C-03 게스트 입장 컨테이너. PIN·닉네임·캐릭터 상태를 소유하고 렌더는 JoinPage에 맡긴다.
 *
 * QR로 들어오면 주소에 `?pin=`이 실려 있다(서버 `joinUrl`과 같은 형식) — 그 값으로 PIN을 채운다.
 * PIN이 6자리가 되면 방을 미리 조회해 제목·정원·유료 여부를 보여 주고, 닉네임은 입장 전에
 * 중복을 미리 확인한다(서버도 입장 순간 같은 규칙으로 막는다).
 */
function JoinContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = useAuthStore((s) => s.status);

  const pinFromQuery = (searchParams.get("pin") ?? "").replace(/\D/g, "").slice(0, PIN_LENGTH);
  const [values, setValues] = useState<JoinValues>({
    ...INITIAL_JOIN_VALUES,
    pin: pinFromQuery,
  });
  const [paidGuest, setPaidGuest] = useState(false);
  const [debouncedNickname, setDebouncedNickname] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedNickname(values.nickname), NICKNAME_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [values.nickname]);

  const pinReady = values.pin.length === PIN_LENGTH;
  const room = useRoomByPin(pinReady ? values.pin : null);
  const roomId = room.data?.id ?? null;
  const guestAllowed = room.data?.guestAllowed ?? false;

  // 게스트가 못 들어가는 방이면 닉네임을 물어볼 필요가 없다 — 로그인·결제가 먼저다
  const nicknameCheck = useNicknameCheck(guestAllowed ? roomId : null, debouncedNickname);
  const join = useJoinRoom(roomId);

  const handleSubmit = () => {
    if (!room.data || join.isPending) return;
    setPaidGuest(false);

    // 유료 방 — 회원은 결제 화면으로, 게스트는 로그인 안내
    if (!room.data.guestAllowed) {
      if (status === "authenticated") router.push(`/pay/${values.pin}`);
      else setPaidGuest(true);
      return;
    }

    join.mutate(
      { nickname: values.nickname.trim(), avatarId: values.avatar },
      { onSuccess: () => router.push(`/play/${values.pin}`) },
    );
  };

  const errorMessage = paidGuest
    ? PAID_ROOM_LOGIN_MESSAGE
    : join.isError
      ? toJoinErrorMessage(join.error)
      : // PIN을 다 넣었는데 방을 못 찾은 경우만 알린다 — 입력 중에는 조용히 둔다
        pinReady && room.isError
        ? toJoinErrorMessage(room.error)
        : null;

  return (
    <JoinPage
      values={values}
      onChange={setValues}
      onSubmit={handleSubmit}
      pending={join.isPending}
      errorMessage={errorMessage}
      loginHref={paidGuest ? `/login?next=${encodeURIComponent(`/pay/${values.pin}`)}` : null}
      room={room.data ? toRoomPreview(room.data) : null}
      nickname={nicknameCheck.data ?? null}
      onPickSuggestion={(nickname) => setValues((prev) => ({ ...prev, nickname }))}
    />
  );
}

// useSearchParams()는 App Router에서 Suspense 경계가 필요하다(없으면 next build 실패).
export default function Page() {
  return (
    <Suspense fallback={<ScreenLoading />}>
      <JoinContainer />
    </Suspense>
  );
}
