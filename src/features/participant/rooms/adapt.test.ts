import { describe, expect, it } from "vitest";
import type { PublicRoomResponse } from "@/lib/types/dto";
import { toPublicRoomItems } from "./adapt";

function publicRoom(over: Partial<PublicRoomResponse> = {}): PublicRoomResponse {
  return {
    id: 11,
    title: "실기기 테스트 방",
    status: "WAITING",
    type: "PAID",
    fee: 3000,
    participantCount: 1,
    host: { userId: 2, nickname: "연결확인" },
    ...over,
  };
}

/** F-1 — 홈 캐러셀과 같은 규칙. 자세한 배경은 `features/home/adapt.test.ts`에 적었다. */
describe("toPublicRoomItems", () => {
  it("방 id를 문자열로 바꾸지 않고 그대로 싣는다", () => {
    const [item] = toPublicRoomItems([publicRoom({ id: 11 })]);

    expect(item.roomId).toBe(11);
  });

  it("참가비는 유료 방에만 싣는다", () => {
    expect(toPublicRoomItems([publicRoom({ type: "PAID", fee: 3000 })])[0].entryFee).toBe(3000);
    expect(
      toPublicRoomItems([publicRoom({ type: "FREE", fee: undefined })])[0].entryFee,
    ).toBeNull();
  });
});
