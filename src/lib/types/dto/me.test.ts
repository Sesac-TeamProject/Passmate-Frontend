import { describe, expect, it } from "vitest";
import { mockCumulativeReport, mockJoinedRooms } from "@/lib/mocks/me";
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
});
