import { describe, expect, it } from "vitest";
import {
  mockCheckNickname,
  mockCreateRoom,
  mockHostedRooms,
  mockJoinRoom,
  mockParticipants,
  mockPublicRooms,
  mockQuestionTimes,
  mockRoom,
  mockRoomByPin,
  mockUpdateQuestionTimes,
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
  "host",
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
  "questionCount",
  "estimatedSeconds",
  "minTimeLimitSec",
  "maxTimeLimitSec",
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

  it("호스트용 방 상세에는 호스트 이름과 세트 요약(문항 수·소요 시간·제한시간 범위)이 있다 (B-21)", () => {
    const room = mockRoom("1");

    expectContract(room.host, ["userId", "nickname"]);
    expect(room.questionCount).toBeGreaterThan(0);
    expect(room.minTimeLimitSec).toBeLessThanOrEqual(room.maxTimeLimitSec as number);
    // 세트가 없는 방은 네 필드가 통째로 빠진다 — 0으로 채우면 "0문항"이 된다
    const noSet = mockCreateRoom({ title: "세트 없는 방" });
    expect(noSet).not.toHaveProperty("questionCount");
    expect(noSet).not.toHaveProperty("estimatedSeconds");
  });

  it("방이 덮어쓴 문항별 시간이 상세의 소요 시간·제한시간 범위에 반영된다", () => {
    const before = mockRoom("1");
    const [first] = mockQuestionTimes("1").questions;
    mockUpdateQuestionTimes("1", {
      times: [{ questionId: first.questionId, timeLimitSec: 600 }],
    });

    const after = mockRoom("1");
    expect(after.maxTimeLimitSec).toBe(600);
    expect(after.estimatedSeconds).toBe(
      (before.estimatedSeconds as number) - first.defaultTimeLimitSec + 600,
    );
    mockUpdateQuestionTimes("1", { times: [] });
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
      ["roomId", "title", "status", "studentCount", "ratingCount"],
      ["endedAt", "correctRate", "averageStars"],
    );
    expect(hosted.ended[0]).not.toHaveProperty("pin");
    // 시작 전에 닫은 방도 종료 목록에 온다 — status 로 가른다(2026-09-07 결정)
    expect(hosted.ended.map((r) => r.status)).toContain("CANCELED");
  });
});

/**
 * 백엔드 `room/dto/RoomQuestionTimeDtos.kt` (develop @ 546d513)와 1:1인지 고정한다.
 * 시연 방(1번)은 세트 1번이 붙어 있고 그 세트에 문항이 있다.
 */
describe("방 문항별 시간 계약", () => {
  const DEMO_ROOM_ID = "1";

  it("GET …/question-times — 문항 줄에 세트 기본값·방 값·자동 넘김이 있고 정답·해설은 없다", () => {
    const res = mockQuestionTimes(DEMO_ROOM_ID);

    expectContract(res, ["roomId", "questionSetId", "estimatedSeconds", "questions"]);
    expectContract(res.questions[0], [
      "questionId",
      "orderNo",
      "type",
      "content",
      "defaultTimeLimitSec",
      "timeLimitSec",
      "overridden",
      "autoAdvance",
    ]);
    expect(res.questions[0]).not.toHaveProperty("answer");
    // 덮어쓴 게 없으면 방 값 = 세트 기본값, 합계는 방 값의 합
    expect(res.questions.every((q) => q.timeLimitSec === q.defaultTimeLimitSec)).toBe(true);
    expect(res.estimatedSeconds).toBe(res.questions.reduce((s, q) => s + q.timeLimitSec, 0));
  });

  it("PUT은 전체 교체 — 본문에 없는 문항은 세트 기본값으로 돌아가고 자동 넘김은 기본(켬)이다", () => {
    const [first, second] = mockQuestionTimes(DEMO_ROOM_ID).questions;
    // 설정을 안 만졌으면 전부 켬 (2026-09-08 시나리오 테스트 반전)
    expect(first.autoAdvance).toBe(true);

    const saved = mockUpdateQuestionTimes(DEMO_ROOM_ID, {
      times: [
        { questionId: first.questionId, timeLimitSec: 45, autoAdvance: false },
        { questionId: second.questionId, timeLimitSec: second.defaultTimeLimitSec },
      ],
    });
    expect(saved.questions[0]).toMatchObject({
      timeLimitSec: 45,
      overridden: true,
      autoAdvance: false,
    });
    // 기본값과 같은 값이라도 본문에 실었으면 덮어쓴 문항이다 — 자동 넘김은 생략하면 기본(켬)
    expect(saved.questions[1]).toMatchObject({ overridden: true, autoAdvance: true });

    const reset = mockUpdateQuestionTimes(DEMO_ROOM_ID, {
      times: [{ questionId: second.questionId, timeLimitSec: 60 }],
    });
    // 본문에서 빠진 문항은 시간도 자동 넘김도 기본값으로 — 꺼 뒀던 1번이 다시 켜진다
    expect(reset.questions[0]).toMatchObject({
      timeLimitSec: first.defaultTimeLimitSec,
      overridden: false,
      autoAdvance: true,
    });
    expect(reset.questions[1].timeLimitSec).toBe(60);
  });
});
