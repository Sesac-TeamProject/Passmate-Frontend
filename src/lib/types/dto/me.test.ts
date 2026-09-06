import { describe, expect, it } from "vitest";
import {
  __resetMeForTests,
  mockCumulativeReport,
  mockJoinedRooms,
  mockNotificationSettings,
  mockPutNotificationSettings,
} from "@/lib/mocks/me";
import { ERROR_CODES } from "@/lib/types/error-codes";
import { expectContract } from "./expect-contract";

/**
 * 백엔드 `report/dto/{JoinedRoomResponses,CumulativeReportResponse}.kt` (develop @ 5f433d2)와
 * 1:1인지 고정한다.
 *
 * 마이페이지가 조용히 비는 곳이라 붙잡아 둔다: 참여한 방은 **커서가 아니라 오프셋 페이지**이고,
 * 목록에 **PIN이 없어** 카드에서 바로 방으로 들어갈 수 없다.
 */
describe("마이페이지 계약", () => {
  it("참여한 방은 {summary, rooms: PageResponse} 두 겹이다", () => {
    const page = mockJoinedRooms(new URL("http://x/users/me/rooms/joined"));

    expectContract(page, ["summary", "rooms"]);
    expectContract(page.summary, [
      "completedSessionCount",
      "averageAccuracy",
      "averageRank",
      "weakTopics",
    ]);
    expectContract(page.rooms, [
      "content",
      "page",
      "size",
      "totalElements",
      "totalPages",
      "hasNext",
    ]);
    // 커서 페이지가 아니다 — 예전 응답의 nextCursor는 없다
    expect(page.rooms).not.toHaveProperty("nextCursor");
  });

  it("참여한 방 한 줄에 PIN·진행률이 없다 — 카드에서 바로 못 들어간다", () => {
    const room = mockJoinedRooms(new URL("http://x/users/me/rooms/joined")).rooms.content[0];

    expectContract(
      room,
      ["roomId", "title", "hostNickname", "status", "questionCount", "hasReport"],
      ["startedAt", "endedAt", "fee", "myScore", "myRank", "myAccuracy"],
    );
    expect(room).not.toHaveProperty("pin");
    expect(room).not.toHaveProperty("progressLabel");
  });

  it("누적 리포트는 추이와 취약 주제를 함께 준다", () => {
    const report = mockCumulativeReport();

    expectContract(
      report,
      [
        "joinedRoomCount",
        "completedSessionCount",
        "averageAccuracy",
        "averageRank",
        "trend",
        "weakTopics",
      ],
      ["accuracyChangeFromLastWeek"],
    );
    expectContract(report.trend[0], [
      "roomId",
      "roomTitle",
      "totalScore",
      "accuracy",
      "finalRank",
      "playedAt",
    ]);
  });

  it("시각은 오프셋 없는 UTC naive 문자열이다", () => {
    const room = mockJoinedRooms(new URL("http://x/users/me/rooms/joined")).rooms.content[1];
    expect(room.endedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
  });

  /**
   * 알림 설정은 **부분 갱신이 아니다.** 서버가 일부러 셋 다 `@NotNull`로 받는다 —
   * 토글 하나를 끄면서 나머지를 실수로 되돌리는 것을 막으려는 설계다.
   * 한 번 `Partial`로 바꿨다가 실서버에서 400을 맞았다.
   */
  it("알림 설정 PUT은 세 항목을 다 보내야 한다 — 빠지면 400", () => {
    __resetMeForTests();
    const saved = mockPutNotificationSettings({
      sessionStart: false,
      ratingRequest: true,
      settlementDone: true,
    });

    expectContract(saved, ["sessionStart", "ratingRequest", "settlementDone"]);
    expect(saved.sessionStart).toBe(false);
    expect(() =>
      // @ts-expect-error 타입이 먼저 막는다 — 목도 서버처럼 막는지 함께 본다
      mockPutNotificationSettings({ sessionStart: true }),
    ).toThrowError(expect.objectContaining({ code: ERROR_CODES.INVALID_INPUT }));
  });

  it("알림 설정 GET은 세 항목이 반드시 온다 — optional로 두면 화면이 false로 오해한다", () => {
    __resetMeForTests();
    const settings = mockNotificationSettings();

    expectContract(settings, ["sessionStart", "ratingRequest", "settlementDone"]);
    // 앞 테스트가 끄고 간 값이 새어 들어오면 여기서 잡힌다
    expect(settings).toEqual({ sessionStart: true, ratingRequest: true, settlementDone: true });
  });
});
