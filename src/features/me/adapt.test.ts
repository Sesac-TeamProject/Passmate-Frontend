import { describe, expect, it } from "vitest";
import type { GradeResponse, MyProfileResponse } from "@/lib/types/dto";
import { toProfile } from "./adapt";

const ME: MyProfileResponse = {
  id: 5,
  nickname: "김민지",
  email: "minji@example.com",
  defaultAvatarId: 1,
  joinedAt: "2026-08-01T02:00:00",
  coinBalance: 0,
  stats: { joinedRoomCount: 3, hostedRoomCount: 2 },
};

const GRADE: GradeResponse = {
  level: 3,
  levelName: "검증된 운영자",
  roomsHosted: 12,
  totalStudents: 240,
  ratingCount: 18,
  nextLevel: 4,
  nextLevelName: "베테랑",
  nextRequirements: [
    { type: "ROOMS_HOSTED", label: "방 운영", current: 12, target: 20, met: false },
    { type: "TOTAL_STUDENTS", label: "누적 학생", current: 240, target: 500, met: false },
  ],
  nextLevelProgress: 0.62,
  ratingSamplePending: false,
  unlocked: ["유료 방 개설"],
};

describe("toProfile", () => {
  it("등급 응답이 없으면 레벨 자리를 비운다 — Lv.1로 메우지 않는다", () => {
    const profile = toProfile(ME);

    expect(profile.level).toBeUndefined();
    expect(profile.levelTitle).toBeUndefined();
    expect(profile.progress).toBeUndefined();
    expect(profile.nextLevel).toBeUndefined();
  });

  it("등급 응답이 오면 이름 옆 뱃지에 쓸 레벨·칭호를 채운다", () => {
    const profile = toProfile(ME, GRADE);

    expect(profile.level).toBe(3);
    expect(profile.levelTitle).toBe("검증된 운영자");
  });

  it("서버가 0~1로 주는 진행률을 %로 바꾼다", () => {
    expect(toProfile(ME, GRADE).progress).toBe(62);
  });

  it("승급 조건에서 남은 수를 센다 — 이미 넘겼으면 0", () => {
    const nearlyThere: GradeResponse = {
      ...GRADE,
      nextRequirements: [
        { type: "ROOMS_HOSTED", label: "방 운영", current: 25, target: 20, met: true },
        { type: "TOTAL_STUDENTS", label: "누적 학생", current: 240, target: 500, met: false },
      ],
    };

    expect(toProfile(ME, nearlyThere).nextLevel).toEqual({
      level: 4,
      roomsLeft: 0,
      studentsLeft: 260,
    });
  });

  it("최고 등급이면 다음 등급 자리를 비운다", () => {
    const top: GradeResponse = { ...GRADE, nextLevel: undefined, nextLevelProgress: undefined };

    expect(toProfile(ME, top).nextLevel).toBeUndefined();
    expect(toProfile(ME, top).progress).toBeUndefined();
  });
});
