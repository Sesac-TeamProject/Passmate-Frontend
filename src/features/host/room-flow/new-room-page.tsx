import { MobileTopBar } from "@/components/common/mobile-top-bar";
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
  /** 에디터에서 방금 확정한 세트 id (`?set=`) */
  preferredSetId?: string;
};

/**
 * W-02 v2 방 설정 — 무료/유료 방 옵션.
 *
 * 상단 우측은 **안내문 한 줄**이다. 예전 "1 방 정보 · 2 문제 준비 · 3 대기실" 알약은 뺐다 —
 * 방 만들기는 이 화면에서 끝나고(문제 준비는 세트 화면에서 따로 한다) 시안에도 없다.
 *
 * 폰 폭(768px 미만)은 **전체 화면**이다. 앱 시안 M-13a 의 아래 시트는 뒤에 내가 만든 방이
 * 비치는 그림이라 그 화면 위(`NewRoomSheet`)에서 그린다 — 이 라우트는 에디터 복귀(`?set=`) ·
 * 문제 세트 · 명성 CTA 처럼 **뒤에 깔 화면이 없는 진입**이 온다. 여기서 어두운 바탕을 그리면
 * 가릴 것이 없어 빈 회색 판만 남는다(2026-09-18 확인).
 */
export function NewRoomPage({
  sets,
  level,
  onSubmit,
  pending,
  errorMessage,
  initialValues,
  preferredSetId,
}: Props) {
  return (
    <div className="flex min-h-screen flex-col max-md:min-h-dvh max-md:bg-card">
      <div className="max-md:hidden">
        <FlowTopBar backHref="/host/rooms" title="새 방 만들기">
          <p className="text-label-lg text-muted-foreground">
            방 이름과 문제 세트를 정하면 PIN이 바로 발급돼요
          </p>
        </FlowTopBar>
      </div>

      <main className="flex items-start justify-center pt-9 pb-10 max-md:px-5 max-md:pt-3 max-md:pb-[max(1.5rem,env(safe-area-inset-bottom))] md:flex-1">
        <div className="flex w-full flex-col md:w-auto md:items-center">
          <MobileTopBar title="새 방 만들기" backHref="/host/rooms" className="pb-4" />
          <NewRoomForm
            sets={sets}
            level={level}
            onSubmit={onSubmit}
            pending={pending}
            errorMessage={errorMessage}
            editorHref="/host/editor"
            initialValues={initialValues}
            preferredSetId={preferredSetId}
          />
        </div>
      </main>
    </div>
  );
}
