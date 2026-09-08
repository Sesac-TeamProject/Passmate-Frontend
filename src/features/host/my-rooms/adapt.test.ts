import { describe, expect, it } from "vitest";
import type { HostedRoomsResponse } from "@/lib/types/dto";
import { toLiveRoomHref, toMyRooms } from "./adapt";

const REPUTATION: HostedRoomsResponse["reputation"] = {
  hostedSessionCount: 3,
  totalStudentCount: 40,
  ratingCount: 0,
};

function hosted(over: Partial<HostedRoomsResponse>): HostedRoomsResponse {
  return { reputation: REPUTATION, active: [], ended: [], ...over };
}

const WAITING = {
  roomId: 1,
  title: "대기 중인 방",
  pin: "111111",
  status: "WAITING" as const,
  participantCount: 2,
  currentQuestionNo: 0,
};
const RUNNING = {
  ...WAITING,
  roomId: 2,
  title: "진행 중인 방",
  pin: "222222",
  status: "RUNNING" as const,
};
const ENDED = {
  roomId: 3,
  title: "끝난 방",
  status: "ENDED" as const,
  endedAt: "2026-08-19T11:00:00",
  studentCount: 9,
  correctRate: 77,
  ratingCount: 0,
};
const CANCELED = {
  roomId: 4,
  title: "취소한 방",
  status: "CANCELED" as const,
  endedAt: "2026-08-07T09:00:00",
  studentCount: 0,
  ratingCount: 0,
};

describe("toMyRooms", () => {
  it("진행 중인 방은 시작 전·후를 phase 로 나눠 대기실·진행 화면을 가른다", () => {
    const [waiting, running] = toMyRooms(hosted({ active: [WAITING, RUNNING] }));

    expect(waiting.phase).toBe("WAITING");
    expect(toLiveRoomHref(waiting)).toBe("/host/rooms/111111/lobby");
    expect(running.phase).toBe("RUNNING");
    expect(toLiveRoomHref(running)).toBe("/host/rooms/222222/live");
  });

  it("시작 전에 닫은 방은 종료 목록에 취소로 선다 — 라벨도 '취소'", () => {
    const [ended, canceled] = toMyRooms(hosted({ ended: [ENDED, CANCELED] }));

    expect(ended.canceled).toBe(false);
    expect(ended.endedLabel).toMatch(/종료$/);
    expect(canceled.canceled).toBe(true);
    expect(canceled.endedLabel).toMatch(/취소$/);
    expect(canceled.averageScore).toBeUndefined();
  });
});
