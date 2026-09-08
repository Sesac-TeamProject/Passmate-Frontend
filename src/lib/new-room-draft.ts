/**
 * 방 만들기 입력 임시 보관 (W-02).
 *
 * "맞는 세트가 없나요? 에디터에서 새로 만들기"로 나갔다 돌아오면 화면이 다시 그려져
 * 적어 둔 방 이름·유형·참가비가 사라진다. 그 왕복 동안만 값을 들고 있는다.
 *
 * 탭을 닫으면 사라져야 하므로 sessionStorage다. 방을 만들면 지운다.
 * SSR·테스트처럼 window가 없는 곳에서는 조용히 아무 일도 하지 않는다.
 */
import { useMemo, useSyncExternalStore } from "react";

const KEY = "passmate.newRoomDraft";

export type NewRoomDraft = {
  title: string;
  setId: string;
  roomType: "free" | "paid";
  fee: number;
};

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

/** 저장된 값이 우리가 쓴 모양인지. 손으로 고친 값·옛 형식이면 버린다 */
function isDraft(value: unknown): value is NewRoomDraft {
  if (typeof value !== "object" || value === null) return false;
  const draft = value as Record<string, unknown>;
  return (
    typeof draft.title === "string" &&
    typeof draft.setId === "string" &&
    (draft.roomType === "free" || draft.roomType === "paid") &&
    typeof draft.fee === "number" &&
    Number.isFinite(draft.fee)
  );
}

function parse(raw: string | null): NewRoomDraft | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isDraft(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

const NO_SUBSCRIBE = () => () => {};
const readRaw = () => storage()?.getItem(KEY) ?? null;
/** 서버 렌더에는 sessionStorage가 없다 — null로 두면 하이드레이션이 어긋나지 않는다 */
const readRawOnServer = () => null;

/**
 * 보관된 값을 **렌더 중에** 읽는다. 효과에서 setState로 되살리면 한 프레임 빈 폼이 보이고
 * 린트(`react-hooks/set-state-in-effect`)에도 걸린다 — 값은 한 번 쓰이고 바뀌지 않으므로
 * 구독은 빈 함수로 충분하다. 원문(문자열)을 스냅숏으로 두어야 매 렌더 새 객체가 생기지 않는다.
 */
export function useNewRoomDraft(): NewRoomDraft | null {
  const raw = useSyncExternalStore(NO_SUBSCRIBE, readRaw, readRawOnServer);
  return useMemo(() => parse(raw), [raw]);
}

export function writeNewRoomDraft(draft: NewRoomDraft): void {
  storage()?.setItem(KEY, JSON.stringify(draft));
}

export function clearNewRoomDraft(): void {
  storage()?.removeItem(KEY);
}
