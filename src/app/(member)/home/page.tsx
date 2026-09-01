"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toAvatarKey } from "@/components/common/student-avatar";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toPopularRooms } from "@/features/home/adapt";
import { HomePage } from "@/features/home/home-page";
import { PAID_ROOM_LOGIN_MESSAGE, toJoinErrorMessage } from "@/features/participant/join/adapt";
import { INITIAL_JOIN_VALUES, type JoinValues } from "@/features/participant/join/join-form";
import { toCreateRoomErrorMessage, toQuestionSetOptions } from "@/features/host/room-flow/adapt";
import { NewRoomDialog } from "@/features/host/room-flow/new-room-dialog";
import { useGrade, useMe } from "@/lib/queries/use-me";
import { useQuestionSets } from "@/lib/queries/use-question-sets";
import { useCreateRoom, useJoinByPin, usePublicRooms } from "@/lib/queries/use-rooms";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { CreateRoomRequest } from "@/lib/types/dto";

/** PIN 없이 만들어진 방은 대기실로 갈 수 없다 — 목록에서 다시 찾도록 안내한다 (host/rooms/new와 같은 문구) */
const PIN_MISSING_MESSAGE =
  "방은 만들어졌지만 PIN을 받지 못했어요. 내가 만든 방에서 확인해 주세요.";

/** W-01 v6 홈 컨테이너 — PIN 폼 상태·새 방 모달 open을 소유하고 렌더는 HomePage에 맡긴다. */
export default function Page() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const me = useMe();
  const rooms = usePublicRooms({ sort: "popular", type: "all" });
  const join = useJoinByPin();
  const sets = useQuestionSets("CONFIRMED");
  const grade = useGrade();
  const create = useCreateRoom();

  const [joinValues, setJoinValues] = useState<JoinValues>(INITIAL_JOIN_VALUES);
  const [paidGuestPin, setPaidGuestPin] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [pinMissing, setPinMissing] = useState(false);
  const [defaultsApplied, setDefaultsApplied] = useState(false);

  // 내 프로필이 처음 오면 닉네임·캐릭터 기본값을 한 번 채운다 — 이미 입력을 시작했으면 덮어쓰지 않는다.
  // 렌더 중 조정(react.dev "Adjusting state when a prop changes") — effect 안에서 곧바로 setState하지 않는다.
  if (!defaultsApplied && me.data) {
    const profile = me.data;
    setDefaultsApplied(true);
    setJoinValues((prev) =>
      prev.nickname === "" && prev.avatar === "cat"
        ? { ...prev, nickname: profile.nickname ?? "", avatar: toAvatarKey(profile.avatarId) }
        : prev,
    );
  }

  const handleJoin = () => {
    setPaidGuestPin(null);
    join.mutate(
      {
        pin: joinValues.pin,
        body: { nickname: joinValues.nickname, avatarId: joinValues.avatar },
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

  const handleCreateRoom = (body: CreateRoomRequest) => {
    setPinMissing(false);
    create.mutate(body, {
      onSuccess: (res) => {
        if (!res.pin) {
          setPinMissing(true);
          return;
        }
        setCreateOpen(false);
        router.push(`/host/rooms/${res.pin}/lobby`);
      },
    });
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
        name={me.data?.nickname ?? ""}
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
      <NewRoomDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        sets={toQuestionSetOptions(sets.data?.items ?? [])}
        level={grade.data?.level ?? 1}
        onSubmit={handleCreateRoom}
        pending={create.isPending}
        errorMessage={
          pinMissing
            ? PIN_MISSING_MESSAGE
            : create.isError
              ? toCreateRoomErrorMessage(create.error)
              : null
        }
      />
    </>
  );
}
