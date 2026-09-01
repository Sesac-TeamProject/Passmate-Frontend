import { create } from "zustand";

/**
 * 서버가 "지금은 못 받는다"(503)고 답했는지. 화면 하나의 문제가 아니라 앱 전체 상태라
 * 각 화면이 따로 판단하지 않고 여기 한 곳에 모은다 — E-500(점검 중)을 띄우는 유일한 조건이다.
 *
 * 500·502·504는 여기 담지 않는다. 그쪽은 고장이라 화면마다 다른 안내가 맞고,
 * "잠깐 점검 중이에요"라고 하면 사실이 아니다.
 */
type ServiceStatusState = {
  unavailable: boolean;
  markUnavailable: () => void;
  /** 요청이 한 번이라도 성공하면 되살아난 것으로 본다 */
  clear: () => void;
};

export const useServiceStatusStore = create<ServiceStatusState>()((set) => ({
  unavailable: false,
  markUnavailable: () => set({ unavailable: true }),
  clear: () => set((s) => (s.unavailable ? { unavailable: false } : s)),
}));
