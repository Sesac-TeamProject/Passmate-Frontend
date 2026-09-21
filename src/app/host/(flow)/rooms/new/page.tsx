"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toRoomSummary } from "@/features/host/room-flow/adapt";
import { NewRoomFailed } from "@/features/host/room-flow/new-room-failed";
import { NewRoomPage } from "@/features/host/room-flow/new-room-page";
import { useNewRoomFlow } from "@/features/host/room-flow/use-new-room-flow";

/**
 * W-02 방 만들기 컨테이너 — 전체 화면 진입(PC 의 "새 방 만들기" · 에디터 복귀 `?set=` · 문제 세트 화면).
 * 내가 만든 방에서 폰으로 누른 경우는 이 화면으로 오지 않는다 — 그 화면 위에 시트로 뜬다(M-13a).
 */
function NewRoomContainer() {
  // 에디터가 세트를 확정하고 `?set=`으로 돌려보낸다 — 그 세트를 골라 둔다
  const preferredSetId = useSearchParams().get("set") ?? undefined;
  const flow = useNewRoomFlow();

  if (flow.loading) return <ScreenLoading />;
  if (flow.setsError)
    return <ScreenError message={flow.setsError.message} onRetry={flow.setsError.retry} />;

  // 서버·네트워크 때문에 깨진 실패만 전체 화면으로 알린다 (04 보드 A/B 규칙)
  if (flow.hardFailure)
    return (
      <NewRoomFailed
        summary={toRoomSummary(flow.hardFailure.body, flow.sets)}
        onRetry={flow.hardFailure.retry}
        onBack={flow.hardFailure.dismiss}
        retrying={flow.pending}
      />
    );

  return (
    <NewRoomPage
      sets={flow.sets}
      level={flow.level}
      onSubmit={flow.submit}
      pending={flow.pending}
      errorMessage={flow.errorMessage}
      initialValues={flow.initialValues}
      preferredSetId={preferredSetId}
      // 폼은 처음 그릴 때만 값을 읽는다 — 보관값이 들어오면 키를 바꿔 그 값으로 다시 세운다
      key={flow.formKey}
    />
  );
}

// useSearchParams()는 App Router에서 Suspense 경계가 필요하다(없으면 next build 실패)
export default function Page() {
  return (
    <Suspense fallback={<ScreenLoading />}>
      <NewRoomContainer />
    </Suspense>
  );
}
