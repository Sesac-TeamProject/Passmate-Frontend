import { avatarKeyFromId } from "@/components/common/student-avatar";
import type { ChoiceKey, QuestionResult, Student } from "@/features/host/types";
import type {
  ParticipantEntry,
  RankingEntry,
  SnapshotQuestion,
  SubmissionsResponse,
} from "@/lib/types/dto";
import type { SessionState } from "@/lib/stores/session-reducer";

const CHOICE_KEYS: ChoiceKey[] = ["A", "B", "C", "D"];

/** 참가자 목록 → 대기실·랭킹이 쓰는 학생 뷰 타입 */
export function toStudents(participants: ParticipantEntry[]): Student[] {
  return participants.map((p) => ({
    id: String(p.participantId),
    name: p.nickname,
    avatar: avatarKeyFromId(p.avatarId),
  }));
}

/** 랭킹 항목에도 닉네임·아바타가 실려 오므로 랭킹만으로도 학생 목록을 만들 수 있다 */
export function toRankedStudents(ranking: RankingEntry[]): Student[] {
  return ranking.map((r) => ({
    id: String(r.participantId),
    name: r.nickname,
    avatar: avatarKeyFromId(r.avatarId),
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

/** 여러 뮤테이션 중 처음 실패한 것의 문구. 모두 성공이면 null */
export function firstErrorMessage(...errors: (Error | null)[]): string | null {
  for (const error of errors) if (error) return error.message;
  return null;
}
