import { QUESTION_SETS, ROOM_SETUP } from "@/features/host/mock";
import { FlowTopBar } from "./flow-top-bar";
import { NewRoomForm } from "./new-room-form";
import { StepPills } from "./step-pills";

/** W-02 v2 방 설정 (방 만들기 1/3) — 무료/유료 방 옵션 */
export function NewRoomPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <FlowTopBar backHref="/host/dashboard" title="새 방 만들기">
        <StepPills current={1} />
      </FlowTopBar>
      <main className="flex flex-1 items-start justify-center pt-9 pb-10">
        <NewRoomForm
          sets={QUESTION_SETS}
          setup={ROOM_SETUP}
          nextHref="/host/editor"
          editorHref="/host/editor"
        />
      </main>
    </div>
  );
}
