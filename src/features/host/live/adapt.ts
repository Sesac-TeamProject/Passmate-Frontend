import { toAvatarKey } from "@/components/common/student-avatar";
import type { ChoiceKey, QuestionResult, Student } from "@/features/host/types";
import { choicesOf } from "@/features/participant/play/adapt";
import type {
  ParticipantResponse,
  QuestionEndedPayload,
  QuestionStartedPayload,
  RankingEntry,
  SessionResultsResponse,
  SubmissionStatusPayload,
} from "@/lib/types/dto";
import type { FinalRankRow } from "./final-page";
import type { HardestQuestion, SessionSummary } from "./final-rail";
import type { SolvingStudent } from "./live-rail";
import type { PodiumEntry } from "./podium";

const CHOICE_KEYS: ChoiceKey[] = ["A", "B", "C", "D"];

/** 참가자 목록 → 대기실·랭킹이 쓰는 학생 뷰 타입 */
export function toStudents(participants: ParticipantResponse[]): Student[] {
  return participants.map((p) => ({
    id: String(p.id),
    name: p.nickname,
    avatar: toAvatarKey(p.avatarId),
  }));
}

/** 랭킹 항목에도 닉네임·아바타가 실려 오므로 랭킹만으로도 학생 목록을 만들 수 있다 */
export function toRankedStudents(ranking: RankingEntry[]): Student[] {
  return ranking.map((r) => ({
    id: String(r.participantId),
    name: r.nickname,
    avatar: toAvatarKey(r.avatarId),
  }));
}

/** 정답 원문("REQUIRED"·"O") → 보기 키. 서술형처럼 보기 정답이 없으면 null */
function toCorrectKey(
  answer: string | null,
  choices: string[] | null | undefined,
): ChoiceKey | null {
  if (!answer) return null;
  const index = (choices ?? []).findIndex((c) => c === answer);
  return index >= 0 && index < CHOICE_KEYS.length ? CHOICE_KEYS[index] : null;
}

/**
 * 문항 종료 페이로드 + 랭킹 → W-06 문항 결과 뷰 타입.
 *
 * 보기별 제출 수는 `distribution` **맵**으로 온다 — 키가 보기 **원문**이라 문항의 보기 순서대로
 * 꺼내야 A·B·C·D 자리가 맞는다. 정답률 변동은 지난 문항 정답률이 계약에 없어 0으로 두고
 * 화면이 문구를 감춘다.
 */
export function toQuestionResult(
  reveal: QuestionEndedPayload,
  ranking: RankingEntry[],
  question: QuestionStartedPayload | null,
): QuestionResult {
  // OX는 서버 보기가 없어 choicesOf가 O·X를 채운다 — 학생 화면과 같은 순서
  const choices = question ? choicesOf(question) : null;
  const distribution = (choices ?? []).map((text, i) => ({
    key: CHOICE_KEYS[i] ?? "D",
    text,
    count: reveal.distribution[text] ?? 0,
  }));

  return {
    correct: toCorrectKey(reveal.answer ?? null, choices),
    distribution,
    accuracy: reveal.correctRate,
    accuracyDelta: 0,
    ranking: ranking.map((r) => ({
      rank: r.rank,
      studentId: String(r.participantId),
      score: r.totalScore,
      change: 0,
    })),
  };
}

/**
 * 레일 미니 차트가 쓰는 문항별 정답률 배열.
 * 진행 중 누적 정답률은 계약에 없어(DESIGN_GAPS D-18) 방금 끝난 문항만 채우고 나머지는 null로 둔다 —
 * 차트가 null을 "미진행" 회색 막대로 그린다.
 */
export function toAccuracyByQuestion(
  total: number,
  questionNo: number,
  accuracy: number,
): (number | null)[] {
  return Array.from({ length: total }, (_, i) => (i + 1 === questionNo ? accuracy : null));
}

/**
 * 최종 순위 행 — 아바타·점수는 세션 랭킹에서, 맞힌 문항 수는 세션 결과에서 온다.
 * `RankingEntry`에 correctCount가 없고 `ParticipantResultRow`에 avatarId는 있지만 랭킹이 더
 * 최신이라(이벤트로 온다) participantId로 합친다.
 */
export function toFinalRanking(
  ranking: RankingEntry[],
  results: SessionResultsResponse | undefined,
): FinalRankRow[] {
  const correctById = new Map(
    (results?.participants ?? []).map((p) => [p.participantId, p.correctCount]),
  );

  return ranking.map((r) => ({
    rank: r.rank,
    student: {
      id: String(r.participantId),
      name: r.nickname,
      avatar: toAvatarKey(r.avatarId),
    },
    score: r.totalScore,
    correctCount: correctById.get(r.participantId) ?? null,
  }));
}

/**
 * W-12 포디움(최대 3자리)과 4위부터의 목록으로 가른다.
 * 참가자가 3명이 안 돼도 있는 만큼 포디움에 올린다 — 1·2위가 "4위부터"로 밀리면 안 된다.
 */
export function toPodium(rows: FinalRankRow[]): { podium: PodiumEntry[]; rest: FinalRankRow[] } {
  return {
    podium: rows
      .slice(0, 3)
      .map((r) => ({ student: r.student, score: r.score, correctCount: r.correctCount })),
    rest: rows.slice(3),
  };
}

/** W-12 레일의 세션 요약. 진행 시간은 계약에 없어 늘 null이다 (DESIGN_GAPS D-16) */
export function toSessionSummary(
  results: SessionResultsResponse | undefined,
  studentCount: number,
  questionCount: number,
): SessionSummary {
  return {
    avgAccuracy: results?.summary.avgCorrectRate ?? null,
    studentCount: results?.summary.participantCount ?? studentCount,
    minutes: null,
    questionCount: results?.summary.questionCount ?? questionCount,
  };
}

/** 문항별 정답률을 번호 순서대로 편다. 결과가 아직 없으면 null(차트가 회색 막대로 그린다) */
export function toReportAccuracy(
  results: SessionResultsResponse | undefined,
  questionCount: number,
): (number | null)[] {
  const byNo = new Map((results?.questions ?? []).map((q) => [q.orderNo, q.correctRate]));
  return Array.from({ length: questionCount }, (_, i) => byNo.get(i + 1) ?? null);
}

/** 정답률이 가장 낮은 문항. 결과가 없으면 null */
export function toHardestQuestion(
  results: SessionResultsResponse | undefined,
): HardestQuestion | null {
  const questions = results?.questions ?? [];
  if (questions.length === 0) return null;

  const worst = questions.reduce((a, b) => (b.correctRate < a.correctRate ? b : a));
  return { no: worst.orderNo, accuracy: worst.correctRate, title: worst.content };
}

/**
 * W-05 제출 현황 레일이 쓰는 학생 목록.
 *
 * **누가 냈는지는 서버가 알려주지 않는다** — 제출 현황은 집계(제출 수·정답률·보기 분포)뿐이다.
 * 그래서 개인별 제출 표시는 켜지 않고(전원 `submitted: false`) 화면은 "n/m명 제출" 숫자로 보여준다.
 */
export function toSolvingStudents(participants: ParticipantResponse[]): SolvingStudent[] {
  return participants.map((p) => ({
    id: String(p.id),
    name: p.nickname,
    avatar: toAvatarKey(p.avatarId),
    submitted: false,
  }));
}

/** 진행 중 제출 집계 → 화면이 쓰는 "n/m" 한 쌍. 아직 못 받았으면 0/참가자 수 */
export function toSubmittedCount(
  submission: SubmissionStatusPayload | null,
  participantCount: number,
): { submittedCount: number; totalCount: number } {
  return {
    submittedCount: submission?.submitCount ?? 0,
    totalCount: submission?.participantCount ?? participantCount,
  };
}

/** 여러 뮤테이션 중 처음 실패한 것의 문구. 모두 성공이면 null */
export function firstErrorMessage(...errors: (Error | null)[]): string | null {
  for (const error of errors) if (error) return error.message;
  return null;
}
