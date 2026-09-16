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
import { isErrorCode } from "@/features/participant/pay/payment-errors";
import { ERROR_CODES } from "@/lib/types/error-codes";
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
  // 유료 방은 참가비 결제를 거쳐야 들어간다 — 게스트 입장 경로가 아예 없다(회원 전용)
  const isPaidRoom = room.data?.type === "PAID";

  // 게스트가 못 들어가는 방이면 닉네임을 물어볼 필요가 없다 — 로그인·결제가 먼저다
  const nicknameCheck = useNicknameCheck(guestAllowed ? roomId : null, debouncedNickname);
  const join = useJoinRoom(roomId);

  /**
   * 방으로 넘어가면서 주소의 `?pin=`을 지운다. PIN은 이미 상태에 있으니 화면은 그대로다.
   *
   * 남겨 두면 방이 끝난 뒤 결과 화면에서 뒤로가기를 했을 때 이 주소로 돌아와 **죽은 PIN이
   * 그대로 채워진 채** 다시 조회되고 "없거나 이미 끝난 방이에요"가 뜬다. 지우는 시점은
   * 첫 렌더가 아니라 여기다 — 입장 전에 새로고침(모바일 탭 복구 등)해도 QR로 받은 PIN이 살아 있어야 한다.
   *
   * 히스토리에 항목을 더하지 않는 `replaceState`라 뒤로가기는 브라우저 기본 동작 그대로다
   * (popstate를 가로채는 방식은 히스토리 덫이 돼 되돌렸다 — c0a44d7).
   */
  const enterRoom = (href: string) => {
    if (pinFromQuery !== "") window.history.replaceState(null, "", "/join");
    router.push(href);
  };

  const handleSubmit = () => {
    if (!room.data || join.isPending) return;
    setPaidGuest(false);

    // 유료 방 — 회원은 결제 화면으로, 비로그인은 로그인부터 태운다.
    // 결제 화면은 PIN이 아니라 방 id로 연다(F-1).
    if (isPaidRoom) {
      if (status === "authenticated") enterRoom(`/pay/${roomId}`);
      else setPaidGuest(true);
      return;
    }

    join.mutate(
      { nickname: values.nickname.trim(), avatarId: values.avatar },
      {
        onSuccess: () => enterRoom(`/play/${values.pin}`),
        // 게이트는 서버에 있다 — 결제 화면을 건너뛰고 입장을 직접 불러도 402로 막힌다.
        onError: (error) => {
          if (isErrorCode(error, ERROR_CODES.ENTRY_FEE_REQUIRED)) enterRoom(`/pay/${roomId}`);
          // 이미 들어와 있는 회원 — 다시 등록할 게 없으니 풀이 화면으로 바로 보낸다(스냅샷이 상태를 복구한다)
          if (isErrorCode(error, ERROR_CODES.ALREADY_JOINED)) enterRoom(`/play/${values.pin}`);
        },
      },
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
      loginHref={paidGuest ? `/login?next=${encodeURIComponent(`/pay/${roomId}`)}` : null}
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
