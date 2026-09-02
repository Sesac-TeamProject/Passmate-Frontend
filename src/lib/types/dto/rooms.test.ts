import { describe, expect, it } from "vitest";
import {
  mockCheckNickname,
  mockCreateRoom,
  mockHostedRooms,
  mockJoinRoom,
  mockParticipants,
  mockPublicRooms,
  mockRoomByPin,
} from "@/lib/mocks/rooms";
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

describe("입장 계약", () => {
  it("GET /rooms/pin/{pin}은 RoomSummaryResponse다 — pin·호스트·문항 수는 없다", () => {
    const summary = mockRoomByPin("482913");

    expectContract(
      summary,
      ["id", "title", "status", "type", "participantCount", "guestAllowed"],
      ["topic", "fee", "maxParticipants"],
    );
    // 입장 전에는 알려주지 않는 값들 — 화면이 이 자리를 지어내면 안 된다
    expect(summary).not.toHaveProperty("pin");
    expect(summary).not.toHaveProperty("host");
    expect(summary).not.toHaveProperty("questionCount");
  });

  it("없는 PIN·끝난 방 모두 404 ROOM_NOT_FOUND다 (410이 아니다)", () => {
    expect(() => mockRoomByPin("000000")).toThrowError(
      expect.objectContaining({ kind: "NotFound", code: "ROOM_NOT_FOUND" }),
    );
  });

  it("POST participants는 {participant, accessToken, guestToken} — Bearer는 accessToken이다", () => {
    const joined = mockJoinRoom("1", { nickname: `게스트${Date.now()}` });

    expectContract(joined, ["participant"], ["accessToken", "guestToken"]);
    expectContract(joined.participant, ["id", "nickname", "avatarId", "isGuest", "joinedAt"]);
    // 게스트는 둘 다 받는다 — accessToken은 지금 요청용, guestToken은 나중 기록 이관용
    expect(typeof joined.accessToken).toBe("string");
    expect(typeof joined.guestToken).toBe("string");
    expect(joined).not.toHaveProperty("participantToken");
  });

  it("GET participants는 배열 그대로다 (래퍼 없음)", () => {
    const participants = mockParticipants();

    expect(Array.isArray(participants)).toBe(true);
    expectContract(participants[0], ["id", "nickname", "avatarId", "isGuest", "joinedAt"]);
    // 접속 여부는 서버가 주지 않는다 — 대기실에서 "접속 중" 표시를 만들 근거가 없다
    expect(participants[0]).not.toHaveProperty("isConnected");
  });

  it("닉네임 확인은 {available, suggestions}", () => {
    expectContract(mockCheckNickname("1", "준영"), ["available", "suggestions"]);
  });

  it("GET /rooms/public은 PageResponse<PublicRoomResponse>다", () => {
    const page = mockPublicRooms(new URL("http://x/rooms/public?sort=POPULAR"));

    expectContract(page, ["content", "page", "size", "totalElements", "totalPages", "hasNext"]);
    expectContract(
      page.content[0],
      ["id", "title", "status", "type", "participantCount", "host"],
      ["topic", "fee", "questionCount", "maxParticipants", "scheduledAt", "startedAt"],
    );
    expectContract(page.content[0].host, ["userId", "nickname"]);
  });

  it("공개 방 필터는 대문자 enum이다", () => {
    const free = mockPublicRooms(new URL("http://x/rooms/public?type=FREE"));
    expect(free.content.every((room) => room.type === "FREE")).toBe(true);
  });
});

describe("내가 만든 방 계약", () => {
  it("페이지가 아니라 {reputation, active, ended} 세 덩이다", () => {
    const hosted = mockHostedRooms();

    expectContract(hosted, ["reputation", "active", "ended"]);
    // 커서 페이지가 아니다 — 예전 응답의 items/nextCursor는 없다
    expect(hosted).not.toHaveProperty("items");
    expect(hosted).not.toHaveProperty("nextCursor");
  });

  it("명성 요약에서 등급·별점은 서버가 아직 안 준다", () => {
    const { reputation } = mockHostedRooms();

    expectContract(
      reputation,
      ["hostedSessionCount", "totalStudentCount", "ratingCount"],
      ["level", "nextLevelProgress", "averageStars"],
    );
    // 화면이 Lv.1·0%로 채우면 없는 사실이 된다 — 목도 비워 둔다
    expect(reputation.level).toBeUndefined();
  });

  it("끝난 방에는 PIN이 없다 — 종료 후 재사용되는 값이다", () => {
    const hosted = mockHostedRooms();

    expectContract(
      hosted.active[0],
      ["roomId", "title", "pin", "status", "participantCount", "currentQuestionNo"],
      ["scheduledAt", "startedAt"],
    );
    expectContract(
      hosted.ended[0],
      ["roomId", "title", "studentCount", "ratingCount"],
      ["endedAt", "correctRate", "averageStars"],
    );
    expect(hosted.ended[0]).not.toHaveProperty("pin");
  });
});
