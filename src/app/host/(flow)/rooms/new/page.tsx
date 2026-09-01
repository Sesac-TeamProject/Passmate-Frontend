"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import {
  isFormLevelCreateError,
  toCreateRoomErrorMessage,
  toQuestionSetOptions,
  toNewRoomInitialValues,
  toRoomSummary,
} from "@/features/host/room-flow/adapt";
import { NewRoomFailed } from "@/features/host/room-flow/new-room-failed";
import { NewRoomPage } from "@/features/host/room-flow/new-room-page";
import { useGrade } from "@/lib/queries/use-me";
import { useQuestionSets } from "@/lib/queries/use-question-sets";
import { useCreateRoom } from "@/lib/queries/use-rooms";
import type { CreateRoomRequest } from "@/lib/types/dto";

/** PIN 없이 만들어진 방은 대기실로 갈 수 없다 — 목록에서 다시 찾도록 안내한다 */
const PIN_MISSING_MESSAGE =
  "방은 만들어졌지만 PIN을 받지 못했어요. 내가 만든 방에서 확인해 주세요.";

/** W-02 방 만들기 컨테이너 — 확정 세트 목록·명성 등급을 읽고 POST /rooms 후 대기실로 보낸다. */
export default function Page() {
  const router = useRouter();
  const sets = useQuestionSets("CONFIRMED");
  const grade = useGrade();
  const create = useCreateRoom();
  const [pinMissing, setPinMissing] = useState(false);
  // W-02e가 "입력한 설정은 그대로 남아 있어요"라고 약속하므로 보낸 값을 들고 있는다
  const [lastBody, setLastBody] = useState<CreateRoomRequest | null>(null);

  const handleSubmit = (body: CreateRoomRequest) => {
    setPinMissing(false);
    setLastBody(body);
    create.mutate(body, {
      onSuccess: (res) => {
        if (res.pin) router.push(`/host/rooms/${res.pin}/lobby`);
        else setPinMissing(true);
      },
    });
  };

  if (sets.isPending || grade.isPending) return <ScreenLoading />;
  if (sets.isError)
    return <ScreenError message={sets.error.message} onRetry={() => sets.refetch()} />;

  const options = toQuestionSetOptions(sets.data.items ?? []);

  // 서버·네트워크 때문에 깨진 실패만 전체 화면으로 알린다 (04 보드 A/B 규칙)
  if (create.isError && lastBody && !isFormLevelCreateError(create.error))
    return (
      <NewRoomFailed
        summary={toRoomSummary(lastBody, options)}
        onRetry={() => handleSubmit(lastBody)}
        onBack={() => create.reset()}
        retrying={create.isPending}
      />
    );

  // 등급 조회가 실패해도 방 만들기는 막지 않는다 — 유료 옵션만 잠긴 채로 진행한다.
  const level = grade.data?.level ?? 1;
  const errorMessage = pinMissing
    ? PIN_MISSING_MESSAGE
    : create.isError
      ? toCreateRoomErrorMessage(create.error)
      : null;

  return (
    <NewRoomPage
      sets={options}
      level={level}
      onSubmit={handleSubmit}
      pending={create.isPending}
      errorMessage={errorMessage}
      initialValues={lastBody ? toNewRoomInitialValues(lastBody) : undefined}
    />
  );
}
