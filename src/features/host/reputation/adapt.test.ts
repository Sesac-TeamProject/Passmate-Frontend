import { describe, expect, it } from "vitest";
import { toCriterionGoal, toCriterionProgress, toProfileStatsLine, unitOf } from "./adapt";
import type { LevelCriterion } from "./next-level-card";

const rooms: LevelCriterion = {
  label: "방 운영 횟수",
  current: 12,
  target: 20,
  unit: "회",
  met: false,
};
const rating: LevelCriterion = {
  label: "평균 별점",
  current: 4.7,
  target: 4,
  unit: "점",
  met: true,
};

describe("unitOf", () => {
  it("학생 수는 명, 별점은 점, 나머지는 회", () => {
    expect(unitOf("TOTAL_STUDENTS")).toBe("명");
    expect(unitOf("AVG_RATING")).toBe("점");
    expect(unitOf("ROOMS_HOSTED")).toBe("회");
  });
});

describe("toCriterionGoal", () => {
  it("서버 라벨 뒤에 목표와 단위를 붙인다", () => {
    expect(toCriterionGoal(rooms)).toBe("방 운영 횟수 20회 이상");
  });

  it("별점은 소수 한 자리에 단위를 떼고 적는다 — 시안이 '4.0 이상'이라 쓴다", () => {
    expect(toCriterionGoal(rating)).toBe("평균 별점 4.0 이상");
  });

  it("학생 수는 단위를 붙인다", () => {
    expect(toCriterionGoal({ ...rooms, label: "총 학생", unit: "명", target: 150 })).toBe(
      "총 학생 150명 이상",
    );
  });
});

describe("toCriterionProgress", () => {
  it("미달이면 현재 / 목표", () => {
    expect(toCriterionProgress(rooms)).toBe("12 / 20");
  });

  it("달성이면 체크와 현재 값만", () => {
    expect(toCriterionProgress(rating)).toBe("✓ 4.7");
  });

  it("단위는 붙이지 않는다 — 왼쪽 문구가 이미 달고 있다", () => {
    expect(toCriterionProgress({ ...rooms, unit: "명", current: 96, target: 150 })).toBe(
      "96 / 150",
    );
  });
});

describe("toProfileStatsLine", () => {
  it("세 지표를 가운뎃점으로 잇는다", () => {
    expect(toProfileStatsLine(18, 72, 12)).toBe("참여 18회 · 평균 정답률 72% · 방 운영 12회");
  });

  it("정답률을 못 읽었으면 그 자리만 뺀다 — 0%로 채우지 않는다", () => {
    expect(toProfileStatsLine(18, undefined, 12)).toBe("참여 18회 · 방 운영 12회");
  });

  it("정답률은 반올림한다", () => {
    expect(toProfileStatsLine(1, 71.6, 2)).toBe("참여 1회 · 평균 정답률 72% · 방 운영 2회");
  });
});
