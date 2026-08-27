"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HomePage } from "@/features/home/home-page";
import { POPULAR_ROOMS } from "@/features/home/mock";
import { MY_ROOMS } from "@/features/host/my-rooms/mock";
import { NewRoomDialog } from "@/features/host/room-flow/new-room-dialog";
import { ACCOUNT, LEARNING_RECORD } from "@/features/me/mock";
import { INITIAL_JOIN_VALUES, type JoinValues } from "@/features/participant/join/join-form";

/** 홈에 보여줄 내가 만든 방 — 진행 중 1 + 종료 1 */
function pickMyRooms() {
  const live = MY_ROOMS.find((r) => r.status === "live");
  const ended = MY_ROOMS.find((r) => r.status === "ended");
  return [live, ended].filter((r) => r !== undefined);
}

/** W-01 v6 홈 컨테이너 — PIN 폼 상태·새 방 모달 open을 소유하고 렌더는 HomePage에 맡긴다 */
function HomeContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // 개발용: `/home?empty=1`이면 신규 회원 빈 상태(참여·개설 기록 없음)로 렌더한다. 연동 시 제거 — TODO(API)
  const showEmpty = searchParams.get("empty") === "1";

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
        recentSessions={showEmpty ? [] : LEARNING_RECORD.sessions}
        myRooms={showEmpty ? [] : pickMyRooms()}
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

export default function Page() {
  // useSearchParams는 프리렌더 시 Suspense 경계가 필요하다 (next docs: use-search-params)
  return (
    <Suspense>
      <HomeContainer />
    </Suspense>
  );
}
