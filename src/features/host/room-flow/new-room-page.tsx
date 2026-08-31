import type { CreateRoomRequest } from "@/lib/types/dto";
import type { QuestionSetOption } from "./adapt";
import { FlowTopBar } from "./flow-top-bar";
import { NewRoomForm } from "./new-room-form";
import { StepPills } from "./step-pills";

type Props = {
  sets: QuestionSetOption[];
  level: number;
  onSubmit: (body: CreateRoomRequest) => void;
  pending?: boolean;
  errorMessage?: string | null;
};

/** W-02 v2 방 설정 (방 만들기 1/3) — 무료/유료 방 옵션 */
export function NewRoomPage({ sets, level, onSubmit, pending, errorMessage }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <FlowTopBar backHref="/home" title="새 방 만들기">
        <StepPills current={1} />
      </FlowTopBar>
      <main className="flex flex-1 items-start justify-center pt-9 pb-10">
        <NewRoomForm
          sets={sets}
          level={level}
          onSubmit={onSubmit}
          pending={pending}
          errorMessage={errorMessage}
          editorHref="/host/editor"
        />
      </main>
    </div>
  );
}
