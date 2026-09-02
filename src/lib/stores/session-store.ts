import { create } from "zustand";
import type { SessionSnapshotResponse } from "@/lib/types/dto";
import type { ServerEvent } from "@/lib/types/events";
import {
  applySnapshot,
  initialSessionState,
  isStaleFrame,
  reduceSessionEvent,
  type SessionState,
} from "./session-reducer";

export type ConnectionStatus = "idle" | "connecting" | "connected" | "reconnecting" | "forbidden";

type SessionStore = SessionState & {
  connection: ConnectionStatus;
  /**
   * 스냅샷을 받은 **로컬 시각**(ms). 서버가 스냅샷에 시각을 실어 주지 않아 이것이 유일한 기준이다
   * — 이보다 (여유를 두고) 오래된 프레임은 버린다.
   */
  snapshotTs: number | null;
  dispatch: (event: ServerEvent) => void;
  /** GET /rooms/{id}/session 응답으로 통째 교체. 스냅샷은 WAITING이어도 200이라 null이 올 일은 없다 */
  replaceWithSnapshot: (snapshot: SessionSnapshotResponse) => void;
  /** GET /participants 초기 로딩·폴링 결과 */
  setParticipants: (participants: SessionState["participants"]) => void;
  /** @draft 음성 힌트 복구 — 목 전용 */
  setHints: (hints: SessionState["hints"]) => void;
  setConnection: (c: ConnectionStatus) => void;
  /** 내가 방금 답을 냈다 — 서버는 "내 제출"을 이벤트로 알려주지 않는다 */
  markSubmitted: () => void;
  reset: () => void;
};

export const useSessionStore = create<SessionStore>()((set, get) => ({
  ...initialSessionState,
  connection: "idle",
  snapshotTs: null,

  dispatch: (event) => {
    const { snapshotTs } = get();
    if (snapshotTs !== null && isStaleFrame(event.occurredAt, snapshotTs)) return;
    set((s) => reduceSessionEvent(s, event));
  },

  replaceWithSnapshot: (snapshot) =>
    set((s) => ({ ...applySnapshot(s, snapshot), snapshotTs: Date.now() })),

  setParticipants: (participants) => set({ participants }),
  setHints: (hints) => set({ hints }),
  setConnection: (connection) => set({ connection }),
  markSubmitted: () => set({ submitted: true }),
  reset: () => set({ ...initialSessionState, connection: "idle", snapshotTs: null }),
}));
