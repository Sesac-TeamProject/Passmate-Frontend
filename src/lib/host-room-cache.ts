/**
 * PIN → roomId 캐시 (호스트 진행 화면 전용).
 *
 * 호스트 라우트는 `/host/rooms/[code]`처럼 **PIN**을 주소에 쓰지만 모든 API는 숫자 `roomId`를
 * 받는다. 그런데 `GET /rooms/pin/{pin}`은 **끝난 방을 404로 답한다**(PIN은 활성 방 사이에서만
 * 유일하고 종료 후 재사용된다) — 세션을 끝내는 순간 최종 리포트 화면이 방을 찾지 못하게 된다.
 *
 * 그래서 한 번 알아낸 값을 탭 수명 동안 남긴다. 탭을 닫으면 사라져야 하므로 sessionStorage.
 * SSR·테스트처럼 window가 없는 곳에서는 조용히 아무 일도 하지 않는다.
 */
const KEY_PREFIX = "passmate.hostRoom.";

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

export function readHostRoomId(pin: string): number | null {
  const raw = storage()?.getItem(KEY_PREFIX + pin);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export function writeHostRoomId(pin: string, roomId: number): void {
  storage()?.setItem(KEY_PREFIX + pin, String(roomId));
}
