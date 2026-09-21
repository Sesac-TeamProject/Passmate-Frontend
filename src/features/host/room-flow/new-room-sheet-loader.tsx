"use client";

import { NewRoomSheet } from "./new-room-sheet";
import { useNewRoomFlow } from "./use-new-room-flow";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

/**
 * M-13a 시트에 방 만들기 흐름을 물린다.
 *
 * 컨테이너(app/)가 아니라 여기 둔 이유는 **늦게 마운트하기 위해서**다. 내가 만든 방은 등급을
 * 일부러 따로 부르지 않는 화면인데(방 목록 응답에 이미 들어 있다), 흐름 훅을 그 화면에서 바로
 * 부르면 세트 · 등급 조회가 방문할 때마다 나간다. FAB 을 처음 누른 뒤에 이 조각을 마운트하면
 * 시트를 쓰지 않는 방문에는 요청이 한 건도 늘지 않는다.
 */
export function NewRoomSheetLoader({ open, onOpenChange }: Props) {
  const flow = useNewRoomFlow();

  return (
    <NewRoomSheet
      open={open}
      onOpenChange={onOpenChange}
      loading={flow.loading}
      setsError={flow.setsError}
      sets={flow.sets}
      level={flow.level}
      onSubmit={flow.submit}
      pending={flow.pending}
      errorMessage={flow.errorMessage}
      initialValues={flow.initialValues}
    />
  );
}
