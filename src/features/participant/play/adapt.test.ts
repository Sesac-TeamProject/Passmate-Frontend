import { describe, expect, it } from "vitest";
import type { AnswerResponse, QuestionStartedPayload, RankingEntry } from "@/lib/types/dto";
import {
  toDistributionRows,
  toLiveQuestion,
  toMyRankChip,
  toRevealView,
  toScoreView,
  toTimerProgress,
} from "./adapt";

const BASE: QuestionStartedPayload = {
  sessionQuestionId: 30,
  questionId: 23,
  orderNo: 3,
  totalCount: 3,
  type: "MCQ",
  content: "Spring Bean의 기본 스코프는?",
  choices: ["singleton", "prototype"],
  points: 100,
  timeLimitSec: 30,
  endsAt: "2099-01-01T00:00:00",
};

describe("toLiveQuestion", () => {
  it("객관식은 서버 보기를 A·B… 키로 나열한다", () => {
    const q = toLiveQuestion(BASE, 0);
    expect(q.choices).toEqual([
      { key: "A", text: "singleton" },
      { key: "B", text: "prototype" },
    ]);
  });

  it("OX는 서버가 보기를 보내지 않으므로 O·X 두 보기를 만든다", () => {
    // 서버 `Question.choices`는 OX에서 null이다 — 화면은 보기 없이는 답을 낼 수 없다
    const q = toLiveQuestion({ ...BASE, type: "OX", choices: undefined }, 0);
    expect(q.type).toBe("ox");
    expect(q.choices).toEqual([
      { key: "A", text: "O" },
      { key: "B", text: "X" },
    ]);
  });

  it("서술형은 보기가 없다", () => {
    const q = toLiveQuestion({ ...BASE, type: "ESSAY", choices: undefined }, 0);
    expect(q.choices).toEqual([]);
  });
});

describe("toRevealView", () => {
  const mcq = toLiveQuestion(BASE, 0);
  const ended = { answer: "prototype", explanation: "기본 스코프는 singleton이다." };

  it("고른 보기가 정답 원문과 같으면 correct, 다르면 wrong", () => {
    expect(toRevealView(ended, mcq, 1, true)).toMatchObject({
      outcome: "correct",
      correctIndex: 1,
    });
    expect(toRevealView(ended, mcq, 0, true)).toMatchObject({ outcome: "wrong", correctIndex: 1 });
  });

  it("제출하지 않았으면 missed — 정답은 그대로 보여 준다", () => {
    expect(toRevealView(ended, mcq, null, false)).toMatchObject({
      outcome: "missed",
      correctIndex: 1,
      explanation: "기본 스코프는 singleton이다.",
    });
  });

  it("재접속으로 내 선택을 모르면 submitted — 정오를 지어내지 않는다", () => {
    expect(toRevealView(ended, mcq, null, true).outcome).toBe("submitted");
  });

  it("OX는 O·X 원문으로 정답 보기를 찾는다", () => {
    const ox = toLiveQuestion({ ...BASE, type: "OX", choices: undefined }, 0);
    expect(toRevealView({ answer: "X" }, ox, 1, true)).toMatchObject({
      outcome: "correct",
      correctIndex: 1,
    });
  });

  it("서술형은 정오 대신 모범 답안을 싣고 빈 해설은 null로 접는다", () => {
    const essay = toLiveQuestion({ ...BASE, type: "ESSAY", choices: undefined }, 0);
    expect(toRevealView({ answer: "모범답안", explanation: "  " }, essay, null, true)).toEqual({
      outcome: "essay",
      correctIndex: null,
      modelAnswer: "모범답안",
      explanation: null,
    });
  });
});

describe("toScoreView", () => {
  // 서버 AnswerResponse 전 필드 — 문항 30에 낸 정답, 기본 100 + 속도 보너스 47
  const CORRECT: AnswerResponse = {
    answerId: 7,
    sessionQuestionId: 30,
    isCorrect: true,
    baseScore: 100,
    speedBonus: 47,
    score: 147,
    submittedAt: "2099-01-01T00:00:00",
  };

  it("정답이면 서버가 준 총점과 기본·속도 보너스 내역을 그대로 싣는다", () => {
    expect(toScoreView(CORRECT, 30)).toEqual({
      verdict: "correct",
      score: 147,
      baseScore: 100,
      speedBonus: 47,
    });
  });

  it("오답이면 wrong — 0점도 서버가 확정한 사실이라 숫자를 싣는다", () => {
    const wrong: AnswerResponse = {
      answerId: 8,
      sessionQuestionId: 30,
      isCorrect: false,
      baseScore: 0,
      speedBonus: 0,
      score: 0,
      submittedAt: "2099-01-01T00:00:00",
    };
    expect(toScoreView(wrong, 30)).toEqual({
      verdict: "wrong",
      score: 0,
      baseScore: 0,
      speedBonus: 0,
    });
  });

  it("서술형은 isCorrect가 빠져 온다 — 오답이 아니라 grading이고 채점 전 점수는 싣지 않는다", () => {
    const essay: AnswerResponse = {
      answerId: 9,
      sessionQuestionId: 30,
      baseScore: 0,
      speedBonus: 0,
      score: 0,
      submittedAt: "2099-01-01T00:00:00",
    };
    expect(toScoreView(essay, 30)).toEqual({ verdict: "grading" });
  });

  it("다른 문항에 낸 응답이면 null — 이전 문항 점수가 새 문항에 남지 않는다", () => {
    expect(toScoreView(CORRECT, 31)).toBeNull();
  });

  it("제출 응답이 없으면(아직 안 냈거나 새로고침 뒤) null", () => {
    expect(toScoreView(undefined, 30)).toBeNull();
  });
});

describe("toDistributionRows", () => {
  const mcq = toLiveQuestion(BASE, 0);

  it("보기 순서대로 서버 분포의 인원을 싣고, 막대 비율은 이 문항에 답한 인원 합 기준이다", () => {
    // 분포 키는 보기 원문 — 5명 중 singleton 1명 · prototype 4명, 정답은 prototype
    expect(
      toDistributionRows(
        { answer: "prototype", distribution: { singleton: 1, prototype: 4 } },
        mcq,
      ),
    ).toEqual([
      { key: "A", text: "singleton", count: 1, percent: 20, isAnswer: false },
      { key: "B", text: "prototype", count: 4, percent: 80, isAnswer: true },
    ]);
  });

  it("아무도 고르지 않은 보기는 0명 · 0%이고, 아무도 답하지 않았으면 모든 막대가 0%다", () => {
    expect(toDistributionRows({ answer: "prototype", distribution: {} }, mcq)).toEqual([
      { key: "A", text: "singleton", count: 0, percent: 0, isAnswer: false },
      { key: "B", text: "prototype", count: 0, percent: 0, isAnswer: true },
    ]);
  });

  it("OX는 O·X 키로 분포를 읽는다", () => {
    const ox = toLiveQuestion({ ...BASE, type: "OX", choices: undefined }, 0);
    expect(toDistributionRows({ answer: "O", distribution: { O: 3, X: 1 } }, ox)).toEqual([
      { key: "A", text: "O", count: 3, percent: 75, isAnswer: true },
      { key: "B", text: "X", count: 1, percent: 25, isAnswer: false },
    ]);
  });

  it("서술형은 보기가 없어 분포 줄도 없다", () => {
    const essay = toLiveQuestion({ ...BASE, type: "ESSAY", choices: undefined }, 0);
    expect(toDistributionRows({ answer: "모범답안", distribution: {} }, essay)).toEqual([]);
  });
});

describe("toMyRankChip", () => {
  const RANKING: RankingEntry[] = [
    {
      rank: 1,
      participantId: 11,
      nickname: "준영",
      avatarId: "cat",
      totalScore: 240,
      rankChange: 0,
    },
    {
      rank: 2,
      participantId: 12,
      nickname: "혜림",
      avatarId: "dog",
      totalScore: 180,
      rankChange: -1,
    },
    { rank: 3, participantId: 13, nickname: "민지", avatarId: "fox", totalScore: 150 },
  ];

  it("내 참가자 id의 순위와 서버가 준 변동값을 싣는다", () => {
    expect(toMyRankChip(RANKING, 12)).toEqual({ rank: 2, change: -1 });
  });

  it("변동값이 빠진 줄(첫 문항 등)은 0으로 접는다", () => {
    expect(toMyRankChip(RANKING, 13)).toEqual({ rank: 3, change: 0 });
  });

  it("내가 누구인지 모르거나 순위표에 없으면 null — 순위를 지어내지 않는다", () => {
    expect(toMyRankChip(RANKING, null)).toBeNull();
    expect(toMyRankChip(RANKING, 99)).toBeNull();
  });
});

describe("toTimerProgress", () => {
  it("남은 시간을 제한시간으로 나눈 0~1 비율이다", () => {
    expect(toTimerProgress(15, 30)).toBe(0.5);
  });

  it("음수·초과 값은 0과 1로 자르고, 제한시간이 0이면 0이다", () => {
    expect(toTimerProgress(-3, 30)).toBe(0);
    expect(toTimerProgress(45, 30)).toBe(1);
    expect(toTimerProgress(10, 0)).toBe(0);
  });
});
