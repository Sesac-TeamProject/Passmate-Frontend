import { describe, expect, it } from "vitest";
import { mockCreateRoom } from "@/lib/mocks/rooms";
import { expectContract } from "./expect-contract";

/**
 * 백엔드 `room/dto/{RoomRequests,RoomResponses}.kt` (develop @ 5f433d2)와 1:1인지 고정한다.
 * US2에서 `RoomSummaryResponse`·`JoinRoomResponse`·`ParticipantResponse`로 확장한다.
 */
const ROOM_REQUIRED = [
  "id",
  "title",
  "pin",
  "status",
  "type",
  "hostUserId",
  "participantCount",
  "isPublic",
  "screenLocked",
  "currentQuestionNo",
];
const ROOM_OPTIONAL = [
  "description",
  "topic",
  "fee",
  "questionSetId",
  "maxParticipants",
  "scheduledAt",
  "startedAt",
  "endedAt",
];

describe("rooms 계약", () => {
  it("POST /rooms는 RoomResponse를 돌려준다 — pin·questionSetId·hostUserId 포함", () => {
    const room = mockCreateRoom({ title: "계약 테스트 방" });

    expectContract(room, ROOM_REQUIRED, ROOM_OPTIONAL);
    expect(room.status).toBe("WAITING");
    // 기본값: FREE·비공개. 서버 RoomCreateRequest의 default와 같다
    expect(room.type).toBe("FREE");
    expect(room.isPublic).toBe(false);
  });

  it("PIN은 6자리 숫자다", () => {
    expect(mockCreateRoom({ title: "PIN 테스트" }).pin).toMatch(/^\d{6}$/);
  });

  it("방 생성 요청은 백엔드 필드 이름을 그대로 쓴다 (isPaid·entryFee·isListed 아님)", () => {
    const room = mockCreateRoom({
      title: "옵션 테스트",
      topic: "Spring",
      questionSetId: 1,
      maxParticipants: 30,
      isPublic: true,
    });

    expect(room.topic).toBe("Spring");
    expect(room.questionSetId).toBe(1);
    expect(room.maxParticipants).toBe(30);
    expect(room.isPublic).toBe(true);
  });
});
