import { describe, expect, it } from "vitest";
import { parseServerEvent } from "./events";

/**
 * STOMP 프레임 envelope 파싱 (계약 websocket-events). 깨진 프레임은 화면에 닿기 전에 여기서 버린다 —
 * KMP 클라이언트도 파싱 실패 프레임은 폐기한다.
 */
describe("parseServerEvent", () => {
  const TS = "2026-08-31T10:00:00Z";

  it("계약에 없는 type은 버린다", () => {
    expect(parseServerEvent({ type: "NOT_A_REAL_EVENT", ts: TS, data: {} })).toBeNull();
  });

  it("ts가 없으면 버린다", () => {
    expect(parseServerEvent({ type: "SESSION_STARTED", data: { sessionId: 1 } })).toBeNull();
  });

  it("객체가 아니면 버린다", () => {
    expect(parseServerEvent(null)).toBeNull();
    expect(parseServerEvent("SESSION_STARTED")).toBeNull();
  });

  it("data가 없으면 {}로 채운다 — 리듀서가 undefined를 만나지 않는다", () => {
    const event = parseServerEvent({ type: "SESSION_ENDED", ts: TS });

    expect(event).not.toBeNull();
    expect(event?.type).toBe("SESSION_ENDED");
    expect(event?.data).toEqual({});
  });

  it("정상 프레임은 type·ts·data를 그대로 통과시킨다", () => {
    const data = { questionNo: 3, submittedCount: 2, totalCount: 5 };
    const event = parseServerEvent({ type: "SUBMISSION_UPDATED", ts: TS, data });

    expect(event).toEqual({ type: "SUBMISSION_UPDATED", ts: TS, data });
  });
});
