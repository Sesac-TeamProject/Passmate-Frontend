import { describe, expect, it } from "vitest";
import type { ParticipantResultRow, SessionResultsResponse } from "@/lib/types/dto";
import { toRankRows, toSessionReport } from "./adapt";

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
});
