import { describe, expect, it } from "vitest";
import { parseServerEvent, SERVER_EVENT_TYPES } from "./events";

/**
 * 서버 봉투는 `{type, roomId, occurredAt, payload?}`다(`contracts/ws-events.md` §3).
 *
 * 예전 판은 `{type, ts, data}`를 기대해 **실서버 프레임을 전부 버렸다** — 세션 화면이 아예
 * 움직이지 않던 원인이다. 이 테스트가 그 회귀를 잡는다.
 */
const FRAME = {
  type: "QUESTION_STARTED",
  roomId: 1,
  occurredAt: "2026-09-02T02:12:49.123456",
  payload: { sessionQuestionId: 10, questionId: 2, orderNo: 1 },
};

describe("parseServerEvent", () => {
  it("서버 봉투를 그대로 읽는다", () => {
    expect(parseServerEvent(FRAME)).toEqual({
      type: "QUESTION_STARTED",
      roomId: 1,
      occurredAt: "2026-09-02T02:12:49.123456",
      payload: { sessionQuestionId: 10, questionId: 2, orderNo: 1 },
    });
  });

  it("payload가 없는 이벤트도 받는다 (SESSION_STARTED)", () => {
    const parsed = parseServerEvent({
      type: "SESSION_STARTED",
      roomId: 1,
      occurredAt: "2026-09-02T02:12:49",
    });

    expect(parsed?.type).toBe("SESSION_STARTED");
    expect(parsed?.payload).toBeUndefined();
  });

  it("payload가 배열이어도 그대로 넘긴다 (RANKING_UPDATED)", () => {
    const ranking = [
      { rank: 1, participantId: 11, nickname: "준영", avatarId: "cat", totalScore: 300 },
    ];
    const parsed = parseServerEvent({
      type: "RANKING_UPDATED",
      roomId: 1,
      occurredAt: "2026-09-02T02:12:49",
      payload: ranking,
    });

    expect(parsed?.payload).toEqual(ranking);
  });

  it("옛 프런트 형식(ts·data)은 폐기한다 — occurredAt이 없다", () => {
    expect(
      parseServerEvent({ type: "QUESTION_STARTED", ts: "2026-09-02T02:12:49Z", data: {} }),
    ).toBeNull();
  });

  it("HINT_PUBLISHED 는 힌트 페이로드를 그대로 넘긴다 — 예전 판은 모르는 타입이라 버렸다", () => {
    const hint = {
      hintId: 7,
      sessionQuestionId: 10,
      questionId: 2,
      orderNo: 1,
      audioUrl: "https://storage.example/rooms/1/hints/a.webm?sig=1",
      durationMs: 4200,
      publishedAt: "2026-09-02T02:13:05",
    };
    const parsed = parseServerEvent({ ...FRAME, type: "HINT_PUBLISHED", payload: hint });

    expect(parsed?.type).toBe("HINT_PUBLISHED");
    expect(parsed?.payload).toEqual(hint);
  });

  it("모르는 type·객체가 아닌 값은 폐기한다", () => {
    expect(parseServerEvent({ ...FRAME, type: "REPORT_READY" })).toBeNull();
    expect(parseServerEvent({ ...FRAME, type: "ANSWER_SUBMITTED" })).toBeNull();
    expect(parseServerEvent(null)).toBeNull();
    expect(parseServerEvent("frame")).toBeNull();
  });

  it("roomId가 빠져도 프레임을 버리지 않는다 — 이미 방을 알고 구독한 상태다", () => {
    const withoutRoomId = {
      type: FRAME.type,
      occurredAt: FRAME.occurredAt,
      payload: FRAME.payload,
    };
    expect(parseServerEvent(withoutRoomId)?.roomId).toBe(0);
  });
});

describe("SERVER_EVENT_TYPES", () => {
  it("서버 SessionEventType 10종과 같다", () => {
    expect([...SERVER_EVENT_TYPES].sort()).toEqual(
      [
        "HINT_PUBLISHED",
        "PARTICIPANT_JOINED",
        "PARTICIPANT_LEFT",
        "QUESTION_ENDED",
        "QUESTION_STARTED",
        "RANKING_UPDATED",
        "SCREEN_LOCKED",
        "SESSION_ENDED",
        "SESSION_STARTED",
        "SUBMISSION_UPDATED",
      ].sort(),
    );
  });

  it("서버에 없는 프런트 전용 이벤트를 들고 있지 않다", () => {
    // 예전 판이 기대하던 것 중 서버 enum에 없는 9종 — 영영 오지 않는다 (HINT_PUBLISHED 는 서버에 있다)
    for (const absent of [
      "ANSWER_SUBMITTED",
      "SCORE_UPDATED",
      "REPORT_READY",
      "ROOM_CANCELLED",
      "FEEDBACK_READY",
      "FEEDBACK_FAILED",
      "REVIEW_RECEIVED",
      "PROJECTOR_CONNECTED",
      "PROJECTOR_DISCONNECTED",
    ]) {
      expect(SERVER_EVENT_TYPES).not.toContain(absent);
    }
  });
});
