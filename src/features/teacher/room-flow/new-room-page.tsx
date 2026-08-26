import { QUESTION_SETS } from "@/features/teacher/mock";
import { FlowTopBar } from "./flow-top-bar";
import { NewRoomForm } from "./new-room-form";
import { StepPills } from "./step-pills";

/** W-02 방 설정 (방 만들기 1/3) */
export function NewRoomPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <FlowTopBar backHref="/teacher/dashboard" title="새 방 만들기">
        <StepPills current={1} />
      </FlowTopBar>
      <main className="flex flex-1 items-start justify-center pt-20 pb-10">
        <NewRoomForm sets={QUESTION_SETS} nextHref="/teacher/editor" editorHref="/teacher/editor" />
      </main>
    </div>
  );
}
