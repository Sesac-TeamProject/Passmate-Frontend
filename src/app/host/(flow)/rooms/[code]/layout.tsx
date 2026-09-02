"use client";

import type { ReactNode } from "react";
import { useParams } from "next/navigation";
import { useSessionConnection } from "@/lib/queries/use-session-connection";
import { useRoomByPin } from "@/lib/queries/use-rooms";

/**
 * 대기실·진행·문항 결과가 공유하는 실시간 연결(호스트). 세 화면은 같은 [code] 세그먼트라
 * 화면을 옮겨도 이 레이아웃이 유지된다 — 연결과 세션 스토어(문항 종료 reveal 등)가 끊기지 않는다.
 *
 * 의도적 결정(리뷰에서 확정): 원래 지시는 세 page.tsx가 각각 `useSessionConnection`을 부르는 것이었지만,
 * 그러면 대기실→진행→결과로 넘어갈 때마다 훅의 정리·재실행이 `store.reset()`을 불러 방금 받은
 * QUESTION_ENDED(reveal)가 지워지고, 화면 깜빡임과 불필요한 스냅샷 재조회가 생긴다.
 * 그래서 연결은 여기 한 곳에서만 잡는다 — 세 화면에 훅을 다시 넣지 말 것.
 * 새로고침·뒤로 가기로 다시 들어와도 연결 시 스냅샷(GET /rooms/{id}/session)으로 복구한다.
 */
export default function RoomSessionLayout({ children }: { children: ReactNode }) {
  const params = useParams<{ code: string }>();
  const room = useRoomByPin(params.code ?? null);

  useSessionConnection(room.data?.id ?? null, { isHost: true });

  return children;
}
