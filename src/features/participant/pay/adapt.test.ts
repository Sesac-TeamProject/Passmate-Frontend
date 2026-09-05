import { describe, expect, it } from "vitest";
import type { RoomResponse } from "@/lib/types/dto";
import { toPaidRoom, toPayGate } from "./adapt";

/**
 * F-1 이후 결제 화면은 PIN이 아니라 **방 id**로 열린다(`/pay/[roomId]`).
 * 그래서 방을 `GET /rooms/{roomId}`로 읽고, 화면에 쓸 PIN도 그 응답에서 받는다.
 */
function room(over: Partial<RoomResponse> = {}): RoomResponse {
  return {
    id: 7,
    title: "네트워크 마무리 특강",
    pin: "028627",
    status: "WAITING",
    type: "PAID",
    fee: 3000,
    hostUserId: 2,
    participantCount: 4,
    maxParticipants: 30,
    isPublic: true,
    screenLocked: false,
    currentQuestionNo: 0,
    ...over,
  };
}

describe("toPaidRoom", () => {
  it("화면에 쓸 방 코드로 서버가 준 PIN을 싣는다", () => {
    expect(toPaidRoom(room({ pin: "482913" })).code).toBe("482913");
  });

  it("정원·참가비는 응답 그대로 옮긴다", () => {
    const paid = toPaidRoom(room({ participantCount: 4, maxParticipants: 30, fee: 3000 }));

    expect(paid.capacity).toBe("4명 참여 중 · 최대 30명");
    expect(paid.fee).toBe(3000);
  });

  it("참가비가 비어 오면 0으로 접는다", () => {
    expect(toPaidRoom(room({ fee: undefined })).fee).toBe(0);
  });

  it("정원이 비어 오면 최대 인원을 아예 말하지 않는다 — 서버에서 없음은 0명이 아니라 무제한이다", () => {
    const paid = toPaidRoom(room({ participantCount: 4, maxParticipants: undefined }));

    expect(paid.capacity).toBe("4명 참여 중");
    expect(paid.capacity).not.toContain("최대");
  });

  it("일정이 있으면 그린다 — 예전엔 늘 빈 문자열이었다(F-8)", () => {
    // 시간대에 흔들리지 않게 모양만 본다. 값은 parseServerDateTime이 로컬로 옮긴다
    const paid = toPaidRoom(room({ scheduledAt: "2026-08-28T11:00:00" }));

    expect(paid.schedule).toMatch(/^\d{1,2}\/\d{1,2} \(.\) \d{2}:\d{2}$/);
  });

  it("일정이 없으면 빈 문자열 — 화면이 그 줄을 감춘다", () => {
    expect(toPaidRoom(room({ scheduledAt: undefined })).schedule).toBe("");
  });

  it("호스트 정보는 방 응답에 없어 통째로 비운다 — Lv.1·별점 0을 지어내지 않는다", () => {
    expect(toPaidRoom(room()).host).toBeNull();
  });
});

/**
 * `GET /rooms/pin/{pin}`은 활성 방만 주고 끝난 방은 404였다.
 * id 조회(`GET /rooms/{roomId}`)는 **ENDED·CANCELED도 200으로 준다** — 그 안전망이 없어졌으니
 * 결제 폼을 그리기 전에 화면이 직접 막는다. 서버도 409로 막지만, 돈 내는 화면을 보여 준 뒤에
 * 막는 것은 늦다.
 */
describe("toPayGate", () => {
  it("대기·진행 중인 유료 방이면 결제를 연다", () => {
    expect(toPayGate(room({ status: "WAITING", type: "PAID" }))).toBe("payable");
    expect(toPayGate(room({ status: "RUNNING", type: "PAID" }))).toBe("payable");
  });

  it("무료 방은 결제할 게 없다", () => {
    expect(toPayGate(room({ status: "WAITING", type: "FREE" }))).toBe("free");
  });

  it("끝난 방·취소된 방은 결제 폼을 그리지 않는다", () => {
    expect(toPayGate(room({ status: "ENDED" }))).toBe("closed");
    expect(toPayGate(room({ status: "CANCELED" }))).toBe("closed");
  });

  it("끝난 무료 방은 대기실로 보내지 않고 닫힘으로 본다 — 상태를 먼저 본다", () => {
    expect(toPayGate(room({ status: "ENDED", type: "FREE" }))).toBe("closed");
  });
});
