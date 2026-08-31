"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getParticipants } from "@/lib/api/rooms";
import { getSessionSnapshot } from "@/lib/api/sessions";
import { connectRoomStream } from "@/lib/stomp";
import { useSessionStore } from "@/lib/stores/session-store";
import { AppError } from "@/lib/types/app-error";
import { qk } from "./keys";

/**
 * 연결 → connected 마다 스냅샷(GET /rooms/{id}/session, 404=WAITING → 참가자 목록) → 스토어 통째 교체 → 이후 프레임 dispatch.
 * WAITING이 아니면(진행 중·종료) 참가자 목록도 함께 새로 고쳐 호스트 라이브 화면이 랭킹에 쓸 이름을 갖는다(부가 정보라 실패는 무시).
 * 컴포넌트는 이 훅만 부르고 스토어를 selector 로 읽는다.
 */
export function useSessionConnection(roomId: number | null, { isHost }: { isHost: boolean }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (roomId === null) return;
    const store = useSessionStore.getState();
    store.reset();

    const restore = async () => {
      try {
        const snapshot = await getSessionSnapshot(roomId);
        store.replaceWithSnapshot(snapshot);

        if (useSessionStore.getState().phase !== "WAITING") {
          try {
            const { participants } = await getParticipants(roomId);
            store.setParticipants(participants ?? []);
          } catch {
            // 참가자 목록은 부가 정보 — 실패해도 스냅샷 복구 자체는 유지한다
          }
        }
      } catch (e) {
        if (AppError.isAppError(e) && e.kind === "NotFound") {
          store.replaceWithSnapshot(null);
          const { participants } = await getParticipants(roomId);
          store.setParticipants(participants ?? []);
        } else {
          throw e;
        }
      }
    };

    const disconnect = connectRoomStream({
      roomId,
      isHost,
      onStatus: (s) => {
        store.setConnection(s);
        if (s === "connected")
          void restore().catch((e: unknown) => console.warn("세션 복구 실패", e));
      },
      onEvent: (event) => {
        store.dispatch(event);
        if (event.type === "SUBMISSION_UPDATED" || event.type === "ANSWER_SUBMITTED")
          void queryClient.invalidateQueries({ queryKey: qk.submissions(roomId) });
        if (event.type === "FEEDBACK_READY" || event.type === "REVIEW_RECEIVED")
          void queryClient.invalidateQueries({ queryKey: qk.myResult(roomId) });
        if (event.type === "REPORT_READY")
          void queryClient.invalidateQueries({ queryKey: qk.roomReport(roomId) });
      },
    });

    return () => {
      disconnect();
      store.reset();
    };
  }, [roomId, isHost, queryClient]);
}
