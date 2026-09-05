import type { RoomCreateRequest } from "@/lib/types/dto";
import type { QuestionSetOption } from "./adapt";
import { FlowTopBar } from "./flow-top-bar";
import { NewRoomForm, type NewRoomInitialValues } from "./new-room-form";

type Props = {
  sets: QuestionSetOption[];
  level: number | null;
  onSubmit: (body: RoomCreateRequest) => void;
  pending?: boolean;
  errorMessage?: string | null;
  /** 실패 화면(W-02e)에서 돌아왔을 때 복원할 입력값 */
  initialValues?: NewRoomInitialValues;
};

/**
 * W-02 v2 방 설정 — 무료/유료 방 옵션.
 *
 * 상단 우측은 **안내문 한 줄**이다. 예전 "1 방 정보 · 2 문제 준비 · 3 대기실" 알약은 뺐다 —
 * 방 만들기는 이 화면에서 끝나고(문제 준비는 세트 화면에서 따로 한다) 시안에도 없다.
 */
export function NewRoomPage({
  sets,
  level,
  onSubmit,
  pending,
  errorMessage,
  initialValues,
}: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <FlowTopBar backHref="/home" title="새 방 만들기">
        <p className="text-label-lg text-muted-foreground">
          방 이름과 문제 세트를 정하면 PIN이 바로 발급돼요
        </p>
      </FlowTopBar>
      <main className="flex flex-1 items-start justify-center pt-9 pb-10">
        <NewRoomForm
          sets={sets}
          level={level}
          onSubmit={onSubmit}
          pending={pending}
          errorMessage={errorMessage}
          editorHref="/host/editor"
          initialValues={initialValues}
        />
      </main>
    </div>
  );
}
