import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearGuestRecord,
  clearGuestToken,
  readGuestRecord,
  readGuestRecords,
  readGuestToken,
  writeGuestRecord,
  writeGuestToken,
} from "./guest-token-storage";

/**
 * 게스트는 토큰을 **두 개** 받는다(`research.md` R-6). 둘을 섞으면 게스트의 모든 요청이 401이 되고,
 * 이관용 표를 sessionStorage에 두면 탭을 닫는 순간 기록을 옮길 방법이 사라진다.
 */
function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k: string) => map.get(k) ?? null,
    key: (i: number) => [...map.keys()][i] ?? null,
    removeItem: (k: string) => void map.delete(k),
    setItem: (k: string, v: string) => void map.set(k, v),
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

beforeEach(() => {
  vi.stubGlobal("window", { sessionStorage: memoryStorage(), localStorage: memoryStorage() });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("게스트 Bearer 슬롯 (sessionStorage)", () => {
  it("넣은 accessToken을 그대로 돌려준다", () => {
    writeGuestToken("guest-access-1");
    expect(readGuestToken()).toBe("guest-access-1");
  });

  it("지우면 null", () => {
    writeGuestToken("guest-access-1");
    clearGuestToken();
    expect(readGuestToken()).toBeNull();
  });

  it("Bearer를 지워도 이관용 기록은 남는다 — 가입 유도가 살아 있어야 한다", () => {
    writeGuestToken("guest-access-1");
    writeGuestRecord({ guestToken: "abc", roomId: 1, participantId: 9 });

    clearGuestToken();

    expect(readGuestToken()).toBeNull();
    expect(readGuestRecord(1)?.guestToken).toBe("abc");
  });
});

describe("게스트 이관 기록 슬롯 (localStorage · 7일)", () => {
  it("방별로 보관하고 roomId로 찾는다", () => {
    writeGuestRecord({ guestToken: "a", roomId: 1, participantId: 11 });
    writeGuestRecord({ guestToken: "b", roomId: 2, participantId: 22 });

    expect(readGuestRecords()).toHaveLength(2);
    expect(readGuestRecord(2)).toMatchObject({ guestToken: "b", participantId: 22 });
    expect(readGuestRecord(3)).toBeNull();
  });

  it("같은 방에 다시 입장하면 최신 값으로 덮어쓴다", () => {
    writeGuestRecord({ guestToken: "old", roomId: 1, participantId: 11 });
    writeGuestRecord({ guestToken: "new", roomId: 1, participantId: 12 });

    expect(readGuestRecords()).toHaveLength(1);
    expect(readGuestRecord(1)?.guestToken).toBe("new");
  });

  it("7일이 지난 항목은 읽을 때 정리한다", () => {
    const now = Date.UTC(2026, 8, 2);
    writeGuestRecord({ guestToken: "old", roomId: 1, participantId: 11 }, now - 8 * DAY_MS);
    writeGuestRecord({ guestToken: "fresh", roomId: 2, participantId: 22 }, now - 6 * DAY_MS);

    const alive = readGuestRecords(now);

    expect(alive).toHaveLength(1);
    expect(alive[0].roomId).toBe(2);
  });

  it("이관에 성공한 방만 뺀다", () => {
    writeGuestRecord({ guestToken: "a", roomId: 1, participantId: 11 });
    writeGuestRecord({ guestToken: "b", roomId: 2, participantId: 22 });

    clearGuestRecord(1);

    expect(readGuestRecords().map((r) => r.roomId)).toEqual([2]);
  });

  it("저장된 값이 깨져 있어도 화면을 막지 않는다", () => {
    window.localStorage.setItem("passmate.guestRecords", "{이건 JSON이 아니다");
    expect(readGuestRecords()).toEqual([]);
  });
});
