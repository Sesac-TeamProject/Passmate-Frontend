"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HomePage } from "@/features/home/home-page";
import { POPULAR_ROOMS } from "@/features/home/mock";
import { NewRoomDialog } from "@/features/host/room-flow/new-room-dialog";
import { ACCOUNT } from "@/features/me/mock";
import { INITIAL_JOIN_VALUES, type JoinValues } from "@/features/participant/join/join-form";

/** W-01 v6 홈 컨테이너 — PIN 폼 상태·새 방 모달 open을 소유하고 렌더는 HomePage에 맡긴다 */
export default function Page() {
  const router = useRouter();
  const [joinValues, setJoinValues] = useState<JoinValues>(INITIAL_JOIN_VALUES);
  const [joinPending, setJoinPending] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const handleJoin = () => {
    // TODO(API): PIN 검증·닉네임·아바타 등록 계약 없음 — 검증 후 방으로 이동
    setJoinPending(true);
    router.push(`/play/${joinValues.pin}`);
  };

  return (
    <>
      <HomePage
        name={ACCOUNT.name.slice(1)}
        popularRooms={POPULAR_ROOMS}
        join={{
          values: joinValues,
          onChange: setJoinValues,
          onSubmit: handleJoin,
          pending: joinPending,
        }}
        onCreateRoom={() => setCreateOpen(true)}
      />
      <NewRoomDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
