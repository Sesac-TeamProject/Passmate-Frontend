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

export type ConnectionStatus = "idle" | "connecting" | "connected" | "reconnecting";

type SessionStore = SessionState & {
  connection: ConnectionStatus;
  snapshotTs: string | null;
  dispatch: (event: ServerEvent) => void;
  replaceWithSnapshot: (snapshot: SessionSnapshotResponse | null) => void; // null = 404 미시작 → WAITING 유지, snapshotTs=now
  setParticipants: (participants: SessionState["participants"]) => void; // GET /participants 초기 로딩
  setHints: (hints: SessionState["hints"]) => void; // GET /session/hints 재접속 복구
  setConnection: (c: ConnectionStatus) => void;
  setAiAnalysisEnabled: (v: boolean) => void;
  reset: () => void;
};

export const useSessionStore = create<SessionStore>()((set, get) => ({
  ...initialSessionState,
  connection: "idle",
  snapshotTs: null,
  dispatch: (event) => {
    const { snapshotTs } = get();
    if (snapshotTs && isStaleFrame(event.ts, snapshotTs)) return;
    set((s) => reduceSessionEvent(s, event));
  },
  replaceWithSnapshot: (snapshot) =>
    set((s) =>
      snapshot
        ? { ...applySnapshot(s, snapshot), snapshotTs: snapshot.ts }
        : { ...s, phase: "WAITING", snapshotTs: new Date().toISOString() },
    ),
  setParticipants: (participants) => set({ participants }),
  setHints: (hints) => set({ hints }),
  setConnection: (connection) => set({ connection }),
  setAiAnalysisEnabled: (aiAnalysisEnabled) => set({ aiAnalysisEnabled }),
  reset: () => set({ ...initialSessionState, connection: "idle", snapshotTs: null }),
}));
