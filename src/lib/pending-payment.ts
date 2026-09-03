/**
 * 진행 중인 유료 방 결제 상태 보관 (방 단위). 참가비 결제는 여러 단계(충전 준비 → PG 결제 →
 * 확인 → 참가비 차감 → 입장)를 거치는데, 중간에 실패하거나 새로고침하면 컴포넌트 state가 사라져
 * 이미 끝난 단계를 다시 밟는다 — 두 번 결제·이중 차감이 된다. 각 단계 성공 시 여기에 남겨 두고
 * 재시도는 "아직 안 끝난 첫 단계"부터 이어 간다. 탭을 닫으면 사라져야 하므로 sessionStorage.
 * SSR·테스트처럼 window가 없는 곳에서는 조용히 무시한다.
 */
export type PendingPayment = {
  roomId: number;
  /** POST /coins/charges 로 받은 충전 건 — 있으면 createCharge를 다시 부르지 않는다 */
  chargeId?: number;
  /** 포트원 결제창이 돌려준 결제 건 — 있으면 결제창을 다시 열지 않고 confirm부터 이어 간다 */
  paymentId?: string;
  /** 참가비 차감까지 끝났다 — 남은 건 입장(joinRoom)뿐이다 */
  entryPaid: boolean;
};

const KEY_PREFIX = "passmate.pendingPayment.";

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

function key(roomId: number): string {
  return `${KEY_PREFIX}${roomId}`;
}

export function readPendingPayment(roomId: number): PendingPayment | null {
  const raw = storage()?.getItem(key(roomId));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PendingPayment>;
    if (parsed.roomId !== roomId) return null;
    return {
      roomId,
      chargeId: typeof parsed.chargeId === "number" ? parsed.chargeId : undefined,
      paymentId: typeof parsed.paymentId === "string" ? parsed.paymentId : undefined,
      entryPaid: parsed.entryPaid === true,
    };
  } catch {
    return null;
  }
}

export function writePendingPayment(pending: PendingPayment): void {
  try {
    storage()?.setItem(key(pending.roomId), JSON.stringify(pending));
  } catch {
    // 저장 실패(용량·프라이빗 모드)는 무시한다 — 재시도 보호만 없어질 뿐 결제 흐름 자체는 그대로다
  }
}

export function clearPendingPayment(roomId: number): void {
  storage()?.removeItem(key(roomId));
}
