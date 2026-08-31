"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { avatarIdFromKey, avatarKeyFromId } from "@/components/common/student-avatar";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toPopularRooms } from "@/features/home/adapt";
import { HomePage } from "@/features/home/home-page";
import { PAID_ROOM_LOGIN_MESSAGE, toJoinErrorMessage } from "@/features/participant/join/adapt";
import { INITIAL_JOIN_VALUES, type JoinValues } from "@/features/participant/join/join-form";
import { NewRoomDialog } from "@/features/host/room-flow/new-room-dialog";
import { ACCOUNT } from "@/features/me/mock";
import { useMe } from "@/lib/queries/use-me";
import { useJoinByPin, usePublicRooms } from "@/lib/queries/use-rooms";
import { useAuthStore } from "@/lib/stores/auth-store";

/** W-01 v6 홈 컨테이너 — PIN 폼 상태·새 방 모달 open을 소유하고 렌더는 HomePage에 맡긴다. */
export default function Page() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const me = useMe();
  const rooms = usePublicRooms({ sort: "popular", type: "all" });
  const join = useJoinByPin();

  const [joinValues, setJoinValues] = useState<JoinValues>(INITIAL_JOIN_VALUES);
  const [paidGuestPin, setPaidGuestPin] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [defaultsApplied, setDefaultsApplied] = useState(false);

  // 내 프로필이 처음 오면 닉네임·캐릭터 기본값을 한 번 채운다 — 이미 입력을 시작했으면 덮어쓰지 않는다.
  // 렌더 중 조정(react.dev "Adjusting state when a prop changes") — effect 안에서 곧바로 setState하지 않는다.
  if (!defaultsApplied && me.data) {
    const profile = me.data;
    setDefaultsApplied(true);
    setJoinValues((prev) =>
      prev.nickname === "" && prev.avatar === "cat"
        ? { ...prev, nickname: profile.nickname ?? "", avatar: avatarKeyFromId(profile.avatarId) }
        : prev,
    );
  }

  const handleJoin = () => {
    setPaidGuestPin(null);
    join.mutate(
      {
        pin: joinValues.pin,
        body: { nickname: joinValues.nickname, avatarId: avatarIdFromKey(joinValues.avatar) },
      },
      {
        onSuccess: (data) => {
          if (data.kind === "joined") {
            router.push(`/play/${joinValues.pin}`);
            return;
          }
          // 유료 방 — 회원은 결제로, 게스트는 카드에 로그인 안내
          if (status === "authenticated") {
            router.push(`/pay/${joinValues.pin}`);
          } else {
            setPaidGuestPin(joinValues.pin);
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

  if (rooms.isPending) return <ScreenLoading />;
  if (rooms.isError)
    return <ScreenError message={rooms.error.message} onRetry={() => rooms.refetch()} />;

  return (
    <>
      <HomePage
        name={ACCOUNT.name.slice(1)}
        popularRooms={toPopularRooms(rooms.data.items ?? [])}
        join={{
          values: joinValues,
          onChange: setJoinValues,
          onSubmit: handleJoin,
          pending: join.isPending,
          errorMessage,
          loginHref: paidGuestPin
            ? `/login?next=${encodeURIComponent(`/pay/${paidGuestPin}`)}`
            : null,
        }}
        onCreateRoom={() => setCreateOpen(true)}
      />
      <NewRoomDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
