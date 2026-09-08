import { describe, expect, it } from "vitest";
import { AppError } from "@/lib/types/app-error";
import type { RoomQuestionTimeView } from "@/lib/types/dto";
import { ERROR_CODES } from "@/lib/types/error-codes";
import {
  hasTimingChanges,
  toQuestionTimesRequest,
  toTimingErrorMessage,
  toTimingRows,
} from "./adapt";

function view(over: Partial<RoomQuestionTimeView>): RoomQuestionTimeView {
  return {
    questionId: 1,
    orderNo: 1,
    type: "MCQ",
    content: "스택(stack)의 주요 특징이 아닌 것은 무엇인가요?",
    defaultTimeLimitSec: 30,
    timeLimitSec: 30,
    overridden: false,
    autoAdvance: false,
    ...over,
  };
}

/** 1번 기본값 그대로 · 2번 시간만 덮어씀(90→120) · 3번 시간은 기본값인데 자동 넘김만 켜 둠 */
const QUESTIONS: RoomQuestionTimeView[] = [
  view({ questionId: 1, orderNo: 1 }),
  view({
    questionId: 2,
    orderNo: 2,
    type: "ESSAY",
    defaultTimeLimitSec: 90,
    timeLimitSec: 120,
    overridden: true,
  }),
  view({ questionId: 3, orderNo: 3, type: "OX", overridden: true, autoAdvance: true }),
];

describe("toTimingRows", () => {
  it("세트 기본값이 아니라 이 방에서 쓸 값을 보여주고, 편집분이 있으면 그쪽이 이긴다", () => {
    const rows = toTimingRows(QUESTIONS, { 1: { timeLimitSec: 45 } });

    expect(rows.map((r) => r.timeLimitSec)).toEqual([45, 120, 30]);
    expect(rows.map((r) => r.type)).toEqual(["multiple", "essay", "ox"]);
    expect(rows[2].autoAdvance).toBe(true);
  });
});

describe("toQuestionTimesRequest", () => {
  it("전체 교체 — 기본값 그대로이고 자동 넘김도 꺼진 문항은 본문에서 뺀다", () => {
    expect(toQuestionTimesRequest(QUESTIONS, {}).times).toEqual([
      { questionId: 2, timeLimitSec: 120, autoAdvance: false },
      { questionId: 3, timeLimitSec: 30, autoAdvance: true },
    ]);
  });

  it("기본값으로 되돌린 문항은 본문에서 빠져 서버가 기본값으로 돌린다", () => {
    expect(toQuestionTimesRequest(QUESTIONS, { 2: { timeLimitSec: 90 } }).times).toEqual([
      { questionId: 3, timeLimitSec: 30, autoAdvance: true },
    ]);
  });

  it("시간만 바꿔도 켜 둔 자동 넘김은 그대로 실린다 — 전체 교체라 빼면 꺼진다", () => {
    expect(toQuestionTimesRequest(QUESTIONS, { 3: { timeLimitSec: 45 } }).times).toContainEqual({
      questionId: 3,
      timeLimitSec: 45,
      autoAdvance: true,
    });
  });

  it("자동 넘김만 켠 문항은 기본 시간 그대로 실리고, 끈 문항은 기본 시간이면 본문에서 빠진다", () => {
    const { times } = toQuestionTimesRequest(QUESTIONS, {
      1: { autoAdvance: true },
      3: { autoAdvance: false },
    });
    expect(times).toEqual([
      { questionId: 1, timeLimitSec: 30, autoAdvance: true },
      { questionId: 2, timeLimitSec: 120, autoAdvance: false },
    ]);
  });
});

describe("hasTimingChanges", () => {
  it("편집분이 서버 값과 같으면 바뀐 게 없다", () => {
    expect(hasTimingChanges(QUESTIONS, {})).toBe(false);
    expect(hasTimingChanges(QUESTIONS, { 2: { timeLimitSec: 120 } })).toBe(false);
    expect(hasTimingChanges(QUESTIONS, { 2: { timeLimitSec: 90 } })).toBe(true);
    expect(hasTimingChanges(QUESTIONS, { 3: { autoAdvance: true } })).toBe(false);
    expect(hasTimingChanges(QUESTIONS, { 3: { autoAdvance: false } })).toBe(true);
  });
});

describe("toTimingErrorMessage", () => {
  it("시작한 방(409 CONFLICT)은 그 이유를 말한다 — 세트 확정과는 무관하다", () => {
    expect(toTimingErrorMessage(new AppError("Conflict", { code: ERROR_CODES.CONFLICT }))).toBe(
      "시작한 방은 시간을 바꿀 수 없어요",
    );
  });

  it("세트가 안 붙은 방은 세트 안내를, 그 밖은 서버 문구를 그대로 쓴다", () => {
    expect(
      toTimingErrorMessage(new AppError("Conflict", { code: ERROR_CODES.QUESTION_SET_REQUIRED })),
    ).toBe("이 방에 연결된 문제 세트를 찾지 못했어요");
    expect(toTimingErrorMessage(new Error("boom"))).toBe("저장하지 못했어요. 다시 시도해 주세요");
  });
});
