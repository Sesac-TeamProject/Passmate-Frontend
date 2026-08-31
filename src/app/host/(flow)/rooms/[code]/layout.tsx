"use client";

import type { ReactNode } from "react";
import { useParams } from "next/navigation";
import { useSessionConnection } from "@/lib/queries/use-session-connection";
import { useRoomByPin } from "@/lib/queries/use-rooms";

/**
 * 대기실·진행·문항 결과가 공유하는 실시간 연결(호스트). 세 화면은 같은 [code] 세그먼트라
 * 화면을 옮겨도 이 레이아웃이 유지된다 — 연결과 세션 스토어(문항 종료 reveal 등)가 끊기지 않는다.
 * 각 화면이 따로 연결하면 이동할 때마다 스토어가 초기화돼 방금 받은 이벤트가 사라진다.
 * 새로고침·뒤로 가기로 다시 들어와도 연결 시 스냅샷(GET /rooms/{id}/session)으로 복구한다.
 */
export default function RoomSessionLayout({ children }: { children: ReactNode }) {
  const params = useParams<{ code: string }>();
  const room = useRoomByPin(params.code ?? null);

  useSessionConnection(room.data?.roomId ?? null, { isHost: true });

  return children;
}
