import { describe, expect, it } from "vitest";
import type { PublicRoomResponse } from "@/lib/types/dto";
import { toPopularRooms } from "./adapt";

function publicRoom(over: Partial<PublicRoomResponse> = {}): PublicRoomResponse {
  return {
    id: 7,
    title: "네트워크 마무리 특강",
    status: "WAITING",
    type: "PAID",
    fee: 3000,
    participantCount: 4,
    host: { userId: 2, nickname: "연결확인" },
    ...over,
  };
}

/**
 * F-1: 카드가 들고 있던 `code`는 PIN이 아니라 `String(room.id)`였다. 그 이름 때문에 유료 방
 * 링크가 PIN 자리에 id를 넣어 `/pay/{id}`로 갔고 전부 404였다. 이름을 `roomId`로 바로잡아
 * 같은 착각이 다시 나지 않게 한다.
 */
describe("toPopularRooms", () => {
  it("방 id를 문자열로 바꾸지 않고 그대로 싣는다", () => {
    const [card] = toPopularRooms([publicRoom({ id: 7 })]);

    expect(card.roomId).toBe(7);
  });

  it("유·무료를 소문자 뷰 값으로 옮긴다", () => {
    expect(toPopularRooms([publicRoom({ type: "PAID" })])[0].type).toBe("paid");
    expect(toPopularRooms([publicRoom({ type: "FREE" })])[0].type).toBe("free");
  });
});
