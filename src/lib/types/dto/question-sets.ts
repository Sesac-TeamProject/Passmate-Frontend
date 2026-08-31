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

/* ── 아래는 전부 @draft — 계약 없음(KMP는 목록만 호출). ../docs/tasks.md T027·T028·T076·T087 경로. 계약 도착 시 수정 ── */

/** @draft POST /question-sets/generate 요청 (FR-009·016) */
export type GenerateQuestionSetRequest = {
  topic: string;
  counts: { type: QuestionType; count: number }[];
  difficulty: "EASY" | "MEDIUM" | "HARD";
  materialFileId?: number | null;
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
/** @draft GET /question-sets/{id} · generate 응답 */
export type QuestionSetDetailResponse = {
  setId: number;
  title: string;
  status: "DRAFT" | "CONFIRMED";
  questions: QuestionDraft[];
};
/** @draft PATCH /question-sets/{id} */
export type UpdateQuestionSetRequest = { title?: string; questions?: QuestionDraft[] };
/** @draft GET /me/ai-usage (FR-061) */
export type AiUsageResponse = {
  generationLeft: number;
  generationLimit: number;
  analysisLeft: number;
  analysisLimit: number;
};
/** @draft POST /materials 응답 */
export type MaterialUploadResponse = {
  materialFileId: number;
  fileName: string;
  extractedChars: number;
};
