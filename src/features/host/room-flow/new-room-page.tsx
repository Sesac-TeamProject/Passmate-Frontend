import Link from "next/link";
import { X } from "lucide-react";
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
 * 폰 폭(768px 미만)은 앱 시안 M-13a 새 방 만들기 시트 — 어두운 바탕 위로 아래에서 올라온 시트.
 * 폼은 **한 벌만** 둔다. 두 벌을 그리면 입력 임시 보관(writeNewRoomDraft)이 두 번 돌아 서로 덮어쓴다 —
 * 그래서 폼은 그대로 두고 둘러싼 틀만 폭에 따라 바꾼다. 어두운 바탕을 누르면 내가 만든 방으로 돌아간다.
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
    <div className="flex min-h-screen flex-col max-md:min-h-dvh max-md:bg-ink/40">
      <div className="max-md:hidden">
        <FlowTopBar backHref="/host/rooms" title="새 방 만들기">
          <p className="text-label-lg text-muted-foreground">
            방 이름과 문제 세트를 정하면 PIN이 바로 발급돼요
          </p>
        </FlowTopBar>
      </div>

      {/* 폰 — 시트 위 어두운 바탕. 누르면 닫힌다 */}
      <Link href="/host/rooms" aria-label="닫기" className="min-h-16 flex-1 md:hidden" />

      <main className="flex items-start justify-center pt-9 pb-10 max-md:rounded-t-3xl max-md:bg-card max-md:px-5 max-md:pt-3 max-md:pb-[max(1.5rem,env(safe-area-inset-bottom))] md:flex-1">
        <div className="flex w-full flex-col md:w-auto md:items-center">
          <div className="flex flex-col gap-3 pb-4 md:hidden">
            <span aria-hidden className="mx-auto h-1 w-10 rounded-full bg-border" />
            <div className="flex items-center justify-between">
              <h1 className="text-heading-md text-ink">새 방 만들기</h1>
              <Link
                href="/host/rooms"
                aria-label="닫기"
                className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
              >
                <X size={22} strokeWidth={2} aria-hidden />
              </Link>
            </div>
          </div>
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
