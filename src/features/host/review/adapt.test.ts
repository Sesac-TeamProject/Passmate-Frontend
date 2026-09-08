import { describe, expect, it } from "vitest";
import type { ParticipantResultRow } from "@/lib/types/dto";
import { toRankRows } from "./adapt";

function participant(over: Partial<ParticipantResultRow>): ParticipantResultRow {
  return {
    rank: 1,
    participantId: 1,
    nickname: "준영",
    avatarId: "fox",
    totalScore: 1240,
    correctCount: 7,
    submitCount: 8,
    ...over,
  };
}

describe("toRankRows", () => {
  it("서버가 매긴 순위대로 세운다 — 점수를 다시 계산하지 않는다", () => {
    const rows = toRankRows([
      participant({ rank: 3, participantId: 3, nickname: "민지", totalScore: 990 }),
      participant({ rank: 1, participantId: 1, nickname: "준영", totalScore: 1240 }),
      participant({ rank: 2, participantId: 2, nickname: "해림", totalScore: 1180 }),
    ]);

    expect(rows.map((r) => r.rank)).toEqual([1, 2, 3]);
    expect(rows.map((r) => r.student.name)).toEqual(["준영", "해림", "민지"]);
    expect(rows[0].score).toBe(1240);
  });

  it("한 문항도 내지 않은 학생은 정답 수를 비운다 — 미제출과 0개 정답은 다르다", () => {
    const [submitted, absent] = toRankRows([
      participant({ rank: 1, participantId: 1, submitCount: 8, correctCount: 0 }),
      participant({ rank: 2, participantId: 2, submitCount: 0, correctCount: 0 }),
    ]);

    expect(submitted.correctCount).toBe(0);
    expect(absent.correctCount).toBeNull();
  });

  it("아무도 없으면 빈 목록 — 화면이 '순위에 올라온 학생이 없어요'로 그린다", () => {
    expect(toRankRows([])).toEqual([]);
  });
});
