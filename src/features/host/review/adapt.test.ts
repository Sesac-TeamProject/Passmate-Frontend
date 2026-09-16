import { describe, expect, it } from "vitest";
import type { ParticipantResultRow, SessionResultsResponse } from "@/lib/types/dto";
import { toQuestionInsights, toRankRows, toSessionReport } from "./adapt";

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

function results(over: Partial<SessionResultsResponse>): SessionResultsResponse {
  return {
    roomId: 42,
    title: "결과 방",
    status: "ENDED",
    summary: {
      participantCount: 3,
      questionCount: 2,
      avgCorrectRate: 33.333,
      avgScore: 100,
      aiAnalysisCount: 0,
    },
    questions: [],
    participants: [],
    ...over,
  };
}

describe("toSessionReport", () => {
  it("요약 KPI(제출·완주율·평균 소요·서술형 채점)를 계약 필드에서 채운다", () => {
    const report = toSessionReport(
      results({
        summary: {
          participantCount: 3,
          questionCount: 2,
          avgCorrectRate: 33.333,
          avgScore: 100,
          aiAnalysisCount: 0,
          submittedParticipantCount: 2,
          completionRate: 33.333,
          avgElapsedMs: 251_700,
          essayAnswerCount: 1,
          essayReviewedCount: 0,
        },
      }),
    );

    expect(report.stats.submittedCount).toBe(2);
    expect(report.stats.completionPercent).toBe(33);
    expect(report.stats.avgElapsedSeconds).toBe(252);
    // 첨삭 0건은 "0 / 1" 로 보여야 한다 — null 로 접으면 "—" 가 돼 진행률이 숨는다
    expect(report.stats.essayGradedCount).toBe(0);
    expect(report.stats.essayTotalCount).toBe(1);
  });

  it("구버전 서버라 키가 없으면 비워 둔다 — 표가 '—' 로 그린다", () => {
    const report = toSessionReport(results({}));

    expect(report.stats.submittedCount).toBeNull();
    expect(report.stats.completionPercent).toBeNull();
    expect(report.stats.avgElapsedSeconds).toBeNull();
    expect(report.stats.essayGradedCount).toBeNull();
  });

  it("정답률 키가 아예 없는 서술형은 NaN 이 아니라 빈 값이 된다", () => {
    // 실서버는 널 필드를 빼고 보낸다 — `=== null` 로만 거르면 "Q2 · NaN%" 가 됐다(운영, 2026-09-09)
    const report = toSessionReport(
      results({
        questions: [
          {
            sessionQuestionId: 1,
            questionId: 11,
            orderNo: 1,
            type: "MCQ",
            content: "객관식",
            points: 100,
            submitCount: 2,
            correctCount: 1,
            correctRate: 33.333,
            aiAnalysisCount: 0,
          },
          {
            sessionQuestionId: 2,
            questionId: 12,
            orderNo: 2,
            type: "ESSAY",
            content: "서술형",
            points: 200,
            submitCount: 1,
            correctCount: 0,
            aiAnalysisCount: 0,
          },
        ],
      }),
    );

    expect(report.questions[0].accuracy).toBe(33);
    expect(report.questions[1].accuracy).toBeUndefined();
  });

  it("서술형의 오답 열은 제출자 전원이 아니라 첨삭 0점 수다", () => {
    const report = toSessionReport(
      results({
        questions: [
          {
            sessionQuestionId: 2,
            questionId: 12,
            orderNo: 2,
            type: "ESSAY",
            content: "서술형",
            points: 200,
            submitCount: 9,
            correctCount: 0,
            aiAnalysisCount: 0,
            essayGrading: { full: 1, partial: 1, zero: 2, unreviewed: 5 },
          },
        ],
      }),
    );

    // 예전 식(submitCount - correctCount)이면 9명 — 채점이 안 끝난 문항이 전원 오답으로 보였다
    expect(report.questions[0].wrongCount).toBe(2);
  });
});

describe("toQuestionInsights", () => {
  const essay = {
    sessionQuestionId: 2,
    questionId: 12,
    orderNo: 2,
    type: "ESSAY" as const,
    content: "서술형",
    points: 200,
    submitCount: 4,
    correctCount: 0,
    aiAnalysisCount: 2,
    answer: "연결지향 프로토콜이다",
    teacherComment: "핵심을 잘 짚었어요",
    essayGrading: { full: 1, partial: 2, zero: 0, unreviewed: 1 },
    aiInsight: {
      analyzedCount: 2,
      commonKeyPoints: ["3-way handshake 언급"],
      commonMissingPoints: ["흐름 제어 누락"],
    },
  };
  const mcq = {
    sessionQuestionId: 1,
    questionId: 11,
    orderNo: 1,
    type: "MCQ" as const,
    content: "객관식",
    points: 100,
    submitCount: 2,
    correctCount: 1,
    correctRate: 33.333,
    aiAnalysisCount: 0,
    answer: "찾을 수 없음",
    explanation: "404 는 Not Found 다",
  };

  it("서술형은 첨삭 분포(정답·부분점수·오답)와 미채점 수, AI 판단 기준을 낸다", () => {
    const insight = toQuestionInsights(results({ questions: [essay] })).get("12");

    expect(insight?.gradingBreakdown).toEqual([
      { label: "정답", count: 1, tone: "good" },
      { label: "부분점수", count: 2, tone: "partial" },
      { label: "오답", count: 0, tone: "bad" },
    ]);
    // 첨삭 전 답안은 오답이 아니다 — 막대에 섞지 않고 따로 센다
    expect(insight?.unreviewedCount).toBe(1);
    expect(insight?.criteria).toEqual({
      modelAnswer: "연결지향 프로토콜이다",
      analyzedCount: 2,
      strengths: ["3-way handshake 언급"],
      misses: ["흐름 제어 누락"],
    });
    expect(insight?.explanation).toBeNull();
    expect(insight?.hostComment).toBe("핵심을 잘 짚었어요");
  });

  it("객관식·OX 는 정답·오답·미제출 분포와 세트의 해설란을 그대로 낸다", () => {
    const insight = toQuestionInsights(results({ questions: [mcq] })).get("11");

    // 참가자 3명 중 2명 제출, 그중 1명 정답 → 정답 1 · 오답 1 · 미제출 1
    expect(insight?.gradingBreakdown.map((r) => [r.label, r.count])).toEqual([
      ["정답", 1],
      ["오답", 1],
      ["미제출", 1],
    ]);
    expect(insight?.criteria).toBeNull();
    expect(insight?.explanation).toEqual({ answer: "찾을 수 없음", text: "404 는 Not Found 다" });
  });

  it("구버전 서버라 키가 없으면 0·null 로 접는다 — NaN 을 만들지 않는다", () => {
    const bare = { ...essay, essayGrading: undefined, aiInsight: undefined, answer: undefined };
    const insight = toQuestionInsights(results({ questions: [bare] })).get("12");

    expect(insight?.gradingBreakdown.map((r) => r.count)).toEqual([0, 0, 0]);
    expect(insight?.unreviewedCount).toBe(0);
    expect(insight?.criteria?.modelAnswer).toBeNull();
    expect(insight?.criteria?.analyzedCount).toBe(0);
  });
});
