import type { CursorPage, QuestionType } from "./common";

/** GET /question-sets 항목 — status는 "CONFIRMED"만 확정으로 해석 */
export type QuestionSetDto = {
  setId?: number;
  title?: string;
  status?: string | null;
  questionCount?: number;
  usedCount?: number | null;
  lastUsedAt?: string | null;
  createdAt?: string | null;
};
export type QuestionSetsResponse = CursorPage<QuestionSetDto>;
export type QuestionSetStatusFilter = "CONFIRMED" | "DRAFT";

/* ── 아래는 경로·메서드가 API 명세서 v2로 확정됐다. 요청·응답 필드는 아직 미확보(@draft) ── */

/** @draft POST /question-sets 요청 필드 — 빈 세트 생성 */
export type CreateQuestionSetRequest = { title: string; description?: string };

/** @draft POST /question-sets/{setId}/questions/generate 요청 필드 (FR-009·016) */
export type GenerateQuestionSetRequest = {
  topic: string;
  counts: { type: QuestionType; count: number }[];
  difficulty: "EASY" | "MEDIUM" | "HARD";
};
/** @draft 문항 — 에디터가 보여줄 최소 필드 */
export type QuestionDraft = {
  questionId: number;
  questionNo: number;
  type: QuestionType;
  body: string;
  choices?: string[] | null;
  answer?: string | null;
  explanation?: string | null;
  points: number;
  timeLimitSec: number;
  /** @draft 계약에 없다 — 제한 시간이 끝나면 자동으로 다음 문항으로 넘길지. DESIGN_GAPS D-15 */
  autoAdvance?: boolean | null;
  origin: "AI" | "MANUAL" | "MATERIAL";
};
/** @draft GET /question-sets/{setId} · generate 응답 필드 */
export type QuestionSetDetailResponse = {
  setId: number;
  title: string;
  status: "DRAFT" | "CONFIRMED";
  questions: QuestionDraft[];
};
/** @draft PUT /question-sets/{setId} 요청 필드 */
export type UpdateQuestionSetRequest = { title?: string; questions?: QuestionDraft[] };
