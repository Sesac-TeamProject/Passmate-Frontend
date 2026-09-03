import { toAvatarKey } from "@/components/common/student-avatar";
import type { ChoiceKey, QuestionResult, Student } from "@/features/host/types";
import type {
  ParticipantEntry,
  RankingEntry,
  RoomReportResponse,
  SubmissionParticipant,
  SnapshotQuestion,
  SubmissionsResponse,
} from "@/lib/types/dto";
import type { SessionState } from "@/lib/stores/session-reducer";
import type { FinalRankRow } from "./final-page";
import type { HardestQuestion, SessionSummary } from "./final-rail";
import type { SolvingStudent } from "./live-rail";

const CHOICE_KEYS: ChoiceKey[] = ["A", "B", "C", "D"];

/** 참가자 목록 → 대기실·랭킹이 쓰는 학생 뷰 타입 */
export function toStudents(participants: ParticipantEntry[]): Student[] {
  return participants.map((p) => ({
    id: String(p.participantId),
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
 * 문항 종료 이벤트(reveal) + 제출 집계 + 랭킹 → W-06 문항 결과 뷰 타입.
 * 정답률 변동(accuracyDelta)은 계약에 지난 문항 정답률이 없어 0으로 두고 화면이 문구를 감춘다.
 */
export function toQuestionResult(
  reveal: NonNullable<SessionState["reveal"]>,
  submissions: SubmissionsResponse | undefined,
  ranking: RankingEntry[],
  question: SnapshotQuestion | null,
): QuestionResult {
  const choices = question?.choices ?? null;
  const distribution = submissions?.choices
    ? submissions.choices.map((c, i) => ({
        key: CHOICE_KEYS[i] ?? "D",
        text: c.label ?? "",
        count: c.count ?? 0,
      }))
    : (choices ?? []).map((text, i) => ({ key: CHOICE_KEYS[i] ?? "D", text, count: 0 }));

  return {
    correct: toCorrectKey(reveal.answer, choices),
    distribution,
    accuracy: submissions?.accuracyPercent ?? 0,
    accuracyDelta: 0,
    ranking: ranking.map((r) => ({
      rank: r.rank,
      studentId: String(r.participantId),
      score: r.total,
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
 * 최종 순위 행 — 아바타·점수는 세션 랭킹에서, 맞힌 문항 수는 방 리포트에서 온다.
 * `RankingEntry`에 correctCount가 없고 `RoomReportStudent`에 avatarId가 없어 participantId로 합친다.
 */
export function toFinalRanking(
  ranking: RankingEntry[],
  report: RoomReportResponse | undefined,
): FinalRankRow[] {
  const correctById = new Map(
    (report?.students ?? []).map((s) => [String(s.participantId), s.correctCount ?? null]),
  );
  return ranking.map((r) => ({
    rank: r.rank,
    student: {
      id: String(r.participantId),
      name: r.nickname,
      avatar: toAvatarKey(r.avatarId),
    },
    score: r.total,
    correctCount: correctById.get(String(r.participantId)) ?? null,
  }));
}

/** W-12 레일의 세션 요약. 진행 시간은 계약에 없어 늘 null이다 (DESIGN_GAPS D-16) */
export function toSessionSummary(
  report: RoomReportResponse | undefined,
  studentCount: number,
  questionCount: number,
): SessionSummary {
  return {
    avgAccuracy: report?.summary?.avgAccuracyPercent ?? null,
    studentCount: report?.summary?.studentCount ?? studentCount,
    minutes: null,
    questionCount: report?.summary?.questionCount ?? questionCount,
  };
}

/** 리포트의 문항별 정답률을 문항 번호 순서대로 편다. 아직 채점되지 않은 문항은 null */
export function toReportAccuracy(
  report: RoomReportResponse | undefined,
  questionCount: number,
): (number | null)[] {
  const byNo = new Map(
    (report?.questions ?? []).map((q) => [q.questionNo ?? 0, q.accuracyPercent ?? null]),
  );
  return Array.from({ length: questionCount }, (_, i) => byNo.get(i + 1) ?? null);
}

/** 정답률이 가장 낮은 문항. 채점된 문항이 없으면 null */
export function toHardestQuestion(report: RoomReportResponse | undefined): HardestQuestion | null {
  const scored = (report?.questions ?? []).filter(
    (q): q is typeof q & { accuracyPercent: number } => typeof q.accuracyPercent === "number",
  );
  if (scored.length === 0) return null;
  const worst = scored.reduce((a, b) => (b.accuracyPercent < a.accuracyPercent ? b : a));
  return {
    no: worst.questionNo ?? 0,
    accuracy: worst.accuracyPercent,
    title: worst.title ?? "",
  };
}

/**
 * W-05 제출 현황 레일이 쓰는 학생 목록.
 * 제출 여부는 제출 집계(GET .../submissions)에만 있어, 아직 못 받았으면 참가자 목록으로 대신하고
 * 전원을 "풀이 중"으로 둔다 — 문항이 막 열린 시점의 실제 상태와 같다.
 */
export function toSolvingStudents(
  submissionParticipants: SubmissionParticipant[] | undefined,
  participants: ParticipantEntry[],
): SolvingStudent[] {
  if (submissionParticipants && submissionParticipants.length > 0) {
    return submissionParticipants.map((p) => ({
      id: String(p.participantId),
      name: p.nickname ?? "",
      avatar: toAvatarKey(p.avatarId),
      submitted: p.submitted ?? false,
    }));
  }
  return participants.map((p) => ({
    id: String(p.participantId),
    name: p.nickname,
    avatar: toAvatarKey(p.avatarId),
    submitted: false,
  }));
}

/** 여러 뮤테이션 중 처음 실패한 것의 문구. 모두 성공이면 null */
export function firstErrorMessage(...errors: (Error | null)[]): string | null {
  for (const error of errors) if (error) return error.message;
  return null;
}
