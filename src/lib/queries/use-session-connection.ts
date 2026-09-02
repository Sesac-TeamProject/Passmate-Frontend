"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { getParticipants } from "@/lib/api/rooms";
import { getSessionSnapshot, getVoiceHints } from "@/lib/api/sessions";
import { IS_MOCK } from "@/lib/env";
import { connectRoomStream } from "@/lib/stomp";
import { useSessionStore } from "@/lib/stores/session-store";
import { qk } from "./keys";

/**
 * 실시간 세션 연결.
 *
 * `connected`가 될 때마다 스냅샷(`GET /rooms/{id}/session`)으로 상태를 통째 교체하고, 이후
 * 프레임을 스토어에 흘려보낸다. 스냅샷은 **WAITING이어도 200**이라 예전의 "404 = 미시작" 분기는
 * 없앴다(`ws-events.md` §6).
 *
 * 참가자 명단은 여기서 한 번만 채운다 — 대기 중 갱신은 화면이 `useParticipants(…, {poll})`로
 * 3초 폴링한다(서버가 입·퇴장 이벤트를 발행하지 않는다, 백엔드 질문 B-1).
 *
 * 컴포넌트는 이 훅만 부르고 스토어를 selector로 읽는다.
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
      const snapshot = await getSessionSnapshot(roomId);
      store.replaceWithSnapshot(snapshot);

      try {
        store.setParticipants(await getParticipants(roomId));
      } catch {
        // 명단은 부가 정보 — 실패해도 스냅샷 복구 자체는 유지한다
      }

      // 음성 힌트는 백엔드에 없다(실서버 404) — 목 모드에서만 복구한다
      if (IS_MOCK) {
        try {
          const { hints } = await getVoiceHints(roomId);
          store.setHints(hints ?? []);
        } catch {
          // 힌트도 부가 정보 — 실패는 무시한다
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
          // 형식이 깨진 프레임 하나가 화면 전체를 멈추지 않도록 버린다.
          console.warn("이벤트 처리 실패 — 프레임을 버립니다", event.type, e);
          return;
        }
        // 제출 집계는 이벤트로도 오고 REST로도 읽는다 — 캐시를 함께 맞춘다
        if (event.type === "SUBMISSION_UPDATED")
          void queryClient.invalidateQueries({ queryKey: qk.submissions(roomId) });
        // 세션이 끝나면 결과·리포트를 다시 읽어야 한다(완료 알림 이벤트가 따로 없다)
        if (event.type === "SESSION_ENDED") {
          void queryClient.invalidateQueries({ queryKey: qk.myResult(roomId) });
          void queryClient.invalidateQueries({ queryKey: qk.sessionResults(roomId) });
        }
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
