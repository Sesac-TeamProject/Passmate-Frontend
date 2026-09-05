/**
 * 게스트 토큰 보관 — **슬롯이 둘이다.** 서버가 `POST /rooms/{id}/participants`(무인증) 응답으로
 * 성격이 다른 토큰 두 개를 주기 때문이다(`research.md` R-6).
 *
 * | 슬롯 | 값 | 저장소 | 쓰임 |
 * |---|---|---|---|
 * | `guestAccess` | `accessToken` (게스트 JWT, 1시간, refresh 없음) | sessionStorage | 지금 요청·STOMP CONNECT의 **Bearer** |
 * | `guestRecord` | `guestToken` (32자 hex) + roomId·participantId | localStorage(7일) | 나중에 가입할 때 기록을 옮기는 **표** |
 *
 * 이 둘을 하나로 다루면 게스트의 모든 요청이 401이 된다 — 서버가 Bearer로 받는 것은 `accessToken`이다.
 * 액세스 토큰은 탭을 닫으면 사라져야 하고(sessionStorage), 이관용 표는 가입할 때까지 남아야 한다(localStorage).
 * SSR·테스트처럼 window가 없는 곳에서는 조용히 아무 일도 하지 않는다.
 */
const GUEST_ACCESS_KEY = "passmate.guestToken";
const GUEST_RECORD_KEY = "passmate.guestRecords";

/** 게스트 기록 보관 기간 — 서버 정책 `passmate.policy.guest-retention-days`와 같은 7일 */
const GUEST_RECORD_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** 가입 후 `POST /guest-records/claim`에 넘길 한 방의 기록 표 */
export type GuestRecord = {
  /** 서버가 준 32자 hex — 이관 키 */
  guestToken: string;
  roomId: number;
  participantId: number;
  /** 보관 시작 시각(ms). 7일이 지나면 읽을 때 정리한다 */
  savedAt: number;
};

function sessionStore(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

function localStore(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

/**
 * 지금 요청에 붙일 게스트 Bearer.
 * 이름은 옛 호출부(`api/client.ts`·`stomp.ts`) 호환을 위해 그대로 둔다 — 값은 `accessToken`이다.
 */
export function readGuestToken(): string | null {
  return sessionStore()?.getItem(GUEST_ACCESS_KEY) ?? null;
}

/** 입장 응답의 `accessToken`을 넣는다 (`guestToken`이 아니다) */
export function writeGuestToken(accessToken: string): void {
  sessionStore()?.setItem(GUEST_ACCESS_KEY, accessToken);
}

/** 퇴장·로그아웃 시 Bearer만 지운다. 이관용 기록은 가입할 때까지 남긴다 */
export function clearGuestToken(): void {
  sessionStore()?.removeItem(GUEST_ACCESS_KEY);
}

function parseRecords(raw: string | null): GuestRecord[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is GuestRecord =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as GuestRecord).guestToken === "string" &&
        typeof (item as GuestRecord).roomId === "number" &&
        typeof (item as GuestRecord).savedAt === "number",
    );
  } catch {
    // 손상된 값이면 통째로 버린다 — 이관 표가 없다고 해서 화면이 깨지지는 않는다
    return [];
  }
}

/** 보관 중인 게스트 기록 전부. 읽을 때 7일 지난 항목을 정리한다 */
export function readGuestRecords(now: number = Date.now()): GuestRecord[] {
  const store = localStore();
  if (!store) return [];

  const all = parseRecords(store.getItem(GUEST_RECORD_KEY));
  const alive = all.filter((r) => now - r.savedAt < GUEST_RECORD_TTL_MS);

  if (alive.length !== all.length) {
    if (alive.length === 0) store.removeItem(GUEST_RECORD_KEY);
    else store.setItem(GUEST_RECORD_KEY, JSON.stringify(alive));
  }
  return alive;
}

/**
 * 마지막으로 돌려준 기록. 값이 그대로면 **같은 객체를 다시 돌려주기 위해** 들고 있는다.
 *
 * 결과 화면이 이 함수를 `useSyncExternalStore`의 스냅샷으로 읽는데, React는 스냅샷을
 * `Object.is`로 비교한다(react-dom `checkIfSnapshotChanged`). 호출마다 새 객체를 만들면
 * 항상 달라졌다고 보고 커밋마다 `forceStoreRerender`를 걸어 동기 렌더가 겹치고,
 * 50번(`NESTED_UPDATE_LIMIT`)을 넘기면 React가 "Maximum update depth exceeded"를 던진다.
 * 화면이 그렇게 죽으면 게스트 기록 이관 효과도 실행되지 못한다(QA_BACKLOG F-14).
 */
let lastRead: GuestRecord | null = null;

function isSameRecord(a: GuestRecord | null, b: GuestRecord | null): boolean {
  if (a === null || b === null) return a === b;
  return (
    a.guestToken === b.guestToken &&
    a.roomId === b.roomId &&
    a.participantId === b.participantId &&
    a.savedAt === b.savedAt
  );
}

/**
 * 방 하나의 기록. 결과 화면의 "가입하고 기록 저장하기"가 이 값을 읽는다.
 * 보관된 값이 그대로면 **같은 객체**를 돌려준다(위 `lastRead` 설명).
 */
export function readGuestRecord(roomId: number, now: number = Date.now()): GuestRecord | null {
  const found = readGuestRecords(now).find((r) => r.roomId === roomId) ?? null;

  if (isSameRecord(lastRead, found)) return lastRead;

  lastRead = found;
  return found;
}

/** 입장 응답의 `guestToken`을 방 정보와 함께 보관한다. 같은 방은 최신 값으로 덮어쓴다 */
export function writeGuestRecord(
  record: Omit<GuestRecord, "savedAt">,
  now: number = Date.now(),
): void {
  const store = localStore();
  if (!store) return;

  const others = readGuestRecords(now).filter((r) => r.roomId !== record.roomId);
  store.setItem(GUEST_RECORD_KEY, JSON.stringify([...others, { ...record, savedAt: now }]));
}

/** 이관에 성공한 방을 목록에서 뺀다 */
export function clearGuestRecord(roomId: number, now: number = Date.now()): void {
  const store = localStore();
  if (!store) return;

  const rest = readGuestRecords(now).filter((r) => r.roomId !== roomId);
  if (rest.length === 0) store.removeItem(GUEST_RECORD_KEY);
  else store.setItem(GUEST_RECORD_KEY, JSON.stringify(rest));
}
