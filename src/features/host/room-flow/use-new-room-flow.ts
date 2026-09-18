"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearNewRoomDraft, useNewRoomDraft } from "@/lib/new-room-draft";
import { useGrade } from "@/lib/queries/use-me";
import { useQuestionSets } from "@/lib/queries/use-question-sets";
import { useCreateRoom } from "@/lib/queries/use-rooms";
import type { RoomCreateRequest } from "@/lib/types/dto";
import {
  isFormLevelCreateError,
  toCreateRoomErrorMessage,
  toNewRoomInitialValues,
  toQuestionSetOptions,
  type QuestionSetOption,
} from "./adapt";
import type { NewRoomInitialValues } from "./new-room-form";

/** PIN 없이 만들어진 방은 대기실로 갈 수 없다 — 목록에서 다시 찾도록 안내한다 */
export const PIN_MISSING_MESSAGE =
  "방은 만들어졌지만 PIN을 받지 못했어요. 내가 만든 방에서 확인해 주세요.";

export type NewRoomFlow = {
  /** 세트·등급을 아직 못 읽었다 */
  loading: boolean;
  /** 세트 조회 실패 — 고를 것이 없어 폼을 그릴 수 없다 */
  setsError: { message: string; retry: () => void } | null;
  sets: QuestionSetOption[];
  /** 서버가 등급을 못 주면 null — 없는 Lv.1을 지어내지 않고 서버 403 에 맡긴다 */
  level: number | null;
  submit: (body: RoomCreateRequest) => void;
  pending: boolean;
  /** 폼 안에 한 줄로 붙일 오류 (레벨 부족 · 검증 실패 · PIN 미발급) */
  errorMessage: string | null;
  /** 서버 · 네트워크로 PIN 발급이 깨진 실패 — 전체 화면 W-02e 대상 */
  hardFailure: { body: RoomCreateRequest; retry: () => void; dismiss: () => void } | null;
  initialValues: NewRoomInitialValues | undefined;
  /** 보관값이 뒤늦게 들어오면 폼을 그 값으로 다시 세우기 위한 키 */
  formKey: string;
};

/**
 * 방 만들기 한 벌 — 확정 세트 · 명성 등급 조회, `POST /rooms`, 성공 시 대기실 이동.
 *
 * 전체 화면(W-02 `/host/rooms/new`)과 폰 시트(M-13a, 내가 만든 방 위)가 **같은 흐름**을 쓴다.
 * 두 벌로 복제하면 임시 보관값(`writeNewRoomDraft`)과 오류 분기가 갈라지므로 여기 한 곳에 둔다.
 */
export function useNewRoomFlow(): NewRoomFlow {
  const router = useRouter();
  // 에디터로 나갔다 온 사이에 적어 둔 값. 서버 렌더에는 없어 하이드레이션 뒤에 들어온다
  const draft = useNewRoomDraft();
  const sets = useQuestionSets({ status: "CONFIRMED" });
  const grade = useGrade();
  const create = useCreateRoom();
  const [pinMissing, setPinMissing] = useState(false);
  // W-02e 가 "입력한 설정은 그대로 남아 있어요"라고 약속하므로 보낸 값을 들고 있는다
  const [lastBody, setLastBody] = useState<RoomCreateRequest | null>(null);

  const submit = (body: RoomCreateRequest) => {
    setPinMissing(false);
    setLastBody(body);
    create.mutate(body, {
      onSuccess: (res) => {
        // 방이 만들어졌으면 임시 보관값은 할 일을 다했다
        clearNewRoomDraft();
        if (res.pin) router.push(`/host/rooms/${res.pin}/lobby`);
        else setPinMissing(true);
      },
    });
  };

  // 입력 오류(레벨 부족·검증)는 폼 안에서 한 줄로 처리한다 (04 보드 A/B 규칙)
  const hardFailed = create.isError && lastBody !== null && !isFormLevelCreateError(create.error);

  return {
    loading: sets.isPending || grade.isPending,
    setsError: sets.isError
      ? { message: sets.error.message, retry: () => void sets.refetch() }
      : null,
    sets: sets.data ? toQuestionSetOptions(sets.data.content) : [],
    level: grade.data?.level ?? null,
    submit,
    pending: create.isPending,
    errorMessage: pinMissing
      ? PIN_MISSING_MESSAGE
      : create.isError
        ? toCreateRoomErrorMessage(create.error)
        : null,
    hardFailure:
      hardFailed && lastBody
        ? { body: lastBody, retry: () => submit(lastBody), dismiss: () => create.reset() }
        : null,
    // 만들기 실패 후 되돌아온 값이 임시 보관값보다 최신이다
    initialValues: lastBody ? toNewRoomInitialValues(lastBody) : (draft ?? undefined),
    formKey: draft === null ? "empty" : "restored",
  };
}
