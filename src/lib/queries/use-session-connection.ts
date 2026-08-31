"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { getParticipants } from "@/lib/api/rooms";
import { getSessionSnapshot, getVoiceHints } from "@/lib/api/sessions";
import { connectRoomStream } from "@/lib/stomp";
import { useSessionStore } from "@/lib/stores/session-store";
import { AppError } from "@/lib/types/app-error";
import { qk } from "./keys";

/**
 * 연결 → connected 마다 스냅샷(GET /rooms/{id}/session, 404=WAITING → 참가자 목록) → 스토어 통째 교체 → 이후 프레임 dispatch.
 * WAITING이 아니면(진행 중·종료) 참가자 목록과 음성 힌트 목록도 함께 새로 고친다 — 호스트 라이브 화면이
 * 랭킹에 쓸 이름을 갖고, 새로고침한 학생이 지금까지의 힌트를 잃지 않는다(둘 다 부가 정보라 실패는 무시).
 * 컴포넌트는 이 훅만 부르고 스토어를 selector 로 읽는다.
 */
export function useSessionConnection(roomId: number | null, { isHost }: { isHost: boolean }) {
  const queryClient = useQueryClient();
  // 값이 바뀌면 아래 effect가 정리 → 재실행되며 스트림을 새로 연다
  const [attempt, setAttempt] = useState(0);

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

          try {
            // 힌트는 스냅샷에 없다 — 재접속·새로고침이 지금까지 발행된 힌트를 잃지 않도록 따로 복구한다.
            const { hints } = await getVoiceHints(roomId);
            store.setHints(hints ?? []);
          } catch {
            // 힌트 목록도 부가 정보 — 실패는 무시한다
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
        try {
          store.dispatch(event);
        } catch (e) {
          // 형식이 깨진 프레임 하나가 화면 전체를 멈추지 않도록 버린다 (KMP도 파싱 실패 프레임은 폐기한다).
          console.warn("이벤트 처리 실패 — 프레임을 버립니다", event.type, e);
          return;
        }
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
  }, [roomId, isHost, queryClient, attempt]);

  /** 자동 재연결(지수 백오프)을 기다리지 않고 지금 바로 다시 붙는다 — 학생 화면의 "지금 다시 연결" */
  const reconnect = useCallback(() => setAttempt((n) => n + 1), []);

  return { reconnect };
}
