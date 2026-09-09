import { describe, expect, it } from "vitest";
import type {
  QuestionEndedPayload,
  QuestionStartedPayload,
  RankingEntry,
  SubmissionStatusPayload,
} from "@/lib/types/dto";
import type { FinalRankRow } from "./final-page";
import type { SessionResultsResponse } from "@/lib/types/dto";
import {
  pickSubmissionForQuestion,
  toHardestQuestion,
  toPodium,
  toQuestionResult,
  toReportAccuracy,
  toSessionSummary,
  toTimeLimitLabel,
} from "./adapt";

const OX_QUESTION: QuestionStartedPayload = {
  sessionQuestionId: 32,
  questionId: 23,
  orderNo: 3,
  totalCount: 3,
  type: "OX",
  content: "Spring Bean의 기본 스코프는 prototype이다.",
  points: 100,
  timeLimitSec: 20,
  endsAt: "2099-01-01T00:00:00",
};

const OX_ENDED: QuestionEndedPayload = {
  sessionQuestionId: 32,
  questionId: 23,
  orderNo: 3,
  answer: "X",
  submitCount: 3,
  correctCount: 2,
  correctRate: 66.7,
  distribution: { X: 2, O: 1 },
};

const RANKING_WITH_CHANGE: RankingEntry[] = [
  { rank: 1, participantId: 1, nickname: "가", avatarId: "cat", totalScore: 300, rankChange: 2 },
  { rank: 2, participantId: 2, nickname: "나", avatarId: "dog", totalScore: 200, rankChange: -1 },
  { rank: 3, participantId: 3, nickname: "다", avatarId: "fox", totalScore: 100, rankChange: 0 },
];

describe("toQuestionResult", () => {
  it("순위·정답률 변동을 서버 값 그대로 옮긴다", () => {
    // 서버가 주는데 화면이 0으로 박아 둬 순위 화살표가 늘 "—"였다(2026-09-09)
    const result = toQuestionResult(
      { ...OX_ENDED, accuracyDelta: 12.4 },
      RANKING_WITH_CHANGE,
      null,
    );

    expect(result.accuracyDelta).toBe(12);
    expect(result.ranking.map((row) => row.change)).toEqual([2, -1, 0]);
  });

  it("변동 키가 빠져 오면 0으로 접는다 — 1번 문항·직전에 점수가 없던 참가자", () => {
    const noChange: RankingEntry[] = RANKING_WITH_CHANGE.map((row) => {
      const copy = { ...row };
      delete copy.rankChange;
      return copy;
    });
    const result = toQuestionResult(OX_ENDED, noChange, null);

    expect(result.accuracyDelta).toBe(0);
    expect(result.ranking.every((row) => row.change === 0)).toBe(true);
  });

  it("OX는 보기가 없어도 O·X 분포와 정답 키를 만든다", () => {
    const result = toQuestionResult(OX_ENDED, [], OX_QUESTION);
    expect(result.correct).toBe("B");
    expect(result.distribution).toEqual([
      { key: "A", text: "O", count: 1 },
      { key: "B", text: "X", count: 2 },
    ]);
  });

  it("서술형은 정답 키가 없고 분포도 비어 있다", () => {
    const essay = { ...OX_QUESTION, type: "ESSAY" as const };
    const result = toQuestionResult(
      { ...OX_ENDED, answer: undefined, distribution: {} },
      [],
      essay,
    );
    expect(result.correct).toBeNull();
    expect(result.distribution).toEqual([]);
    expect(result.type).toBe("essay");
  });

  it("서술형의 answer는 보기 정답이 아니라 모범답안 본문이다", () => {
    const essay = { ...OX_QUESTION, type: "ESSAY" as const };
    const result = toQuestionResult(
      {
        ...OX_ENDED,
        answer: "싱글턴은 컨테이너당 인스턴스가 하나다.",
        explanation: "핵심어 두 개를 쓰면 만점",
        distribution: {},
      },
      [],
      essay,
    );

    expect(result.modelAnswer).toBe("싱글턴은 컨테이너당 인스턴스가 하나다.");
    expect(result.explanation).toBe("핵심어 두 개를 쓰면 만점");
    // 보기 정답 자리는 여전히 비어 있어야 한다 — 모범답안을 보기 키로 읽으면 안 된다
    expect(result.correct).toBeNull();
  });

  it("객관식·OX의 answer는 모범답안 자리에 들어가지 않는다", () => {
    const result = toQuestionResult(OX_ENDED, [], OX_QUESTION);

    expect(result.type).toBe("ox");
    expect(result.modelAnswer).toBeNull();
  });

  it("문항 정보가 없어도(재접속) 분포가 비면 서술형으로 다룬다", () => {
    const result = toQuestionResult({ ...OX_ENDED, distribution: {} }, [], null);

    expect(result.type).toBe("essay");
  });

  it("문항 정보가 없어도(재접속) 분포가 차 있으면 객관식으로 다룬다", () => {
    // 서버가 준 분포를 봐야 한다. 보기에서 만든 배열을 보면 문항이 없을 때 늘 비어 있어
    // 객관식이 통째로 서술형으로 분류된다(QA_BACKLOG F-17)
    const result = toQuestionResult(OX_ENDED, [], null);

    expect(result.type).toBe("multiple");
    // 서술형이 아니므로 answer를 모범답안 자리에 넣으면 안 된다
    expect(result.modelAnswer).toBeNull();
  });

  it("정답률은 정수로 접는다 — 서버는 16.666…처럼 소수로 준다", () => {
    const result = toQuestionResult(
      { ...OX_ENDED, correctRate: 16.666666666666668 },
      [],
      OX_QUESTION,
    );

    expect(result.accuracy).toBe(17);
  });
});

function row(rank: number): FinalRankRow {
  return {
    rank,
    student: { id: String(rank), name: `학생${rank}`, avatar: "cat" },
    score: 1000 - rank * 10,
    correctCount: null,
  };
}

describe("toPodium", () => {
  it("3명 이상이면 1~3위가 포디움, 나머지가 4위부터", () => {
    const { podium, rest } = toPodium([row(1), row(2), row(3), row(4)]);
    expect(podium.map((p) => p.student.id)).toEqual(["1", "2", "3"]);
    expect(rest.map((r) => r.rank)).toEqual([4]);
  });

  it("2명이면 포디움에 두 자리만 채우고 목록은 비운다 — 1·2위가 '4위부터'로 밀리지 않는다", () => {
    const { podium, rest } = toPodium([row(1), row(2)]);
    expect(podium.map((p) => p.student.id)).toEqual(["1", "2"]);
    expect(rest).toEqual([]);
  });

  it("아무도 없으면 포디움도 목록도 비어 있다", () => {
    const { podium, rest } = toPodium([]);
    expect(podium).toEqual([]);
    expect(rest).toEqual([]);
  });
});

describe("pickSubmissionForQuestion", () => {
  const status = (sessionQuestionId: number, submitCount: number): SubmissionStatusPayload => ({
    sessionQuestionId,
    submitCount,
    participantCount: 24,
    correctCount: 0,
    correctRate: 0,
    distribution: {},
  });

  it("지금 문항의 집계를 그대로 쓴다", () => {
    expect(pickSubmissionForQuestion(56, status(56, 18))?.submitCount).toBe(18);
  });

  it("이전 문항의 집계는 버린다 — 새 문항에 옛 제출 수가 남으면 안 된다", () => {
    expect(pickSubmissionForQuestion(57, status(56, 18))).toBeNull();
  });

  it("폴링이 낡았으면 이벤트 값을 쓴다", () => {
    // 스토어(이벤트)가 먼저, 최대 3초 낡는 폴링 응답이 뒤
    expect(pickSubmissionForQuestion(57, status(57, 3), status(56, 18))?.submitCount).toBe(3);
  });

  it("이벤트가 낡았으면 폴링 값을 쓴다 — 늦게 온 이벤트에 가리지 않는다", () => {
    expect(pickSubmissionForQuestion(57, status(56, 18), status(57, 3))?.submitCount).toBe(3);
  });

  it("둘 다 없거나 둘 다 낡았으면 null", () => {
    expect(pickSubmissionForQuestion(57, null, undefined)).toBeNull();
    expect(pickSubmissionForQuestion(57, status(56, 18), status(55, 24))).toBeNull();
  });
});

describe("toTimeLimitLabel", () => {
  it("방 상세의 최소·최대로 그린다 — 같으면 한 값, 다르면 범위", () => {
    expect(toTimeLimitLabel({ minTimeLimitSec: 30, maxTimeLimitSec: 30 })).toBe("30초");
    expect(toTimeLimitLabel({ minTimeLimitSec: 30, maxTimeLimitSec: 90 })).toBe("30~90초");
  });

  it("세트를 아직 연결하지 않은 방(값이 빠짐)은 칩을 그리지 않는다", () => {
    expect(toTimeLimitLabel({})).toBeNull();
  });
});

/** 문항별 정답률만 다른 결과 응답 — 나머지 필드는 화면이 쓰지 않는다 */
function results(rates: (number | null)[]): SessionResultsResponse {
  return {
    roomId: 1,
    title: "테스트",
    status: "ENDED",
    summary: {
      participantCount: 3,
      questionCount: rates.length,
      avgCorrectRate: 100 / 3,
      avgScore: 0,
      aiAnalysisCount: 0,
    },
    questions: rates.map((correctRate, i) => ({
      sessionQuestionId: i + 1,
      questionId: i + 1,
      orderNo: i + 1,
      type: correctRate === null ? "ESSAY" : "MCQ",
      content: `${i + 1}번 문항`,
      points: 100,
      submitCount: 3,
      correctCount: 1,
      correctRate,
      aiAnalysisCount: 0,
    })),
    participants: [],
  };
}

describe("toSessionSummary", () => {
  it("평균 정답률을 소수점 첫째 자리까지 접는다 — 서버는 33.333…으로 준다", () => {
    expect(toSessionSummary(results([50]), 3, 1).avgAccuracy).toBe(33.3);
  });

  it("결과가 아직 없으면 null — 0%로 그리지 않는다", () => {
    expect(toSessionSummary(undefined, 3, 5).avgAccuracy).toBeNull();
  });

  it("진행 시간은 시작·종료 시각의 차이(분)다 — 반올림, 1분 미만은 1분", () => {
    const base = results([50]);
    expect(
      toSessionSummary(
        { ...base, startedAt: "2026-09-08T15:47:53", endedAt: "2026-09-08T15:55:47" },
        3,
        1,
      ).minutes,
    ).toBe(8);
    expect(
      toSessionSummary(
        { ...base, startedAt: "2026-09-08T15:47:53", endedAt: "2026-09-08T15:48:10" },
        3,
        1,
      ).minutes,
    ).toBe(1);
  });

  it("시작·종료 시각이 없으면 진행 시간은 null — 레일이 '—'로 그린다", () => {
    expect(toSessionSummary(results([50]), 3, 1).minutes).toBeNull();
    expect(toSessionSummary(undefined, 3, 1).minutes).toBeNull();
  });
});

describe("toReportAccuracy", () => {
  it("서술형은 막대가 비고(null) 나머지는 정수로 접는다", () => {
    expect(toReportAccuracy(results([66.66, null, 40]), 3)).toEqual([67, null, 40]);
  });
});

describe("toHardestQuestion", () => {
  it("자동 채점이 없는 서술형은 후보에서 뺀다 — 0%로 취급하면 늘 최난도가 된다", () => {
    expect(toHardestQuestion(results([80, null, 40]))?.no).toBe(3);
  });

  it("0%가 여럿이면 앞 문항을 고른다 — 열 때마다 답이 바뀌지 않게", () => {
    expect(toHardestQuestion(results([50, 0, 0]))?.no).toBe(2);
  });

  it("채점된 문항이 하나도 없으면 null", () => {
    expect(toHardestQuestion(results([null, null]))).toBeNull();
  });
});
