import type {
  CreateQuestionSetRequest,
  GenerateQuestionSetRequest,
  QuestionSetDetailResponse,
  QuestionSetsResponse,
  QuestionSetStatusFilter,
  UpdateQuestionSetRequest,
} from "@/lib/types/dto";
import { request, requestMultipart } from "./client";

/** GET /question-sets — status는 "CONFIRMED"만 확정으로 해석 */
export function getQuestionSets(
  status?: QuestionSetStatusFilter,
  cursor?: string,
): Promise<QuestionSetsResponse> {
  return request<QuestionSetsResponse>("/question-sets", { query: { status, cursor } });
}

/** POST /question-sets — 빈 세트 생성. AI 생성·문항 추가는 이 세트에 붙는다 */
export function createQuestionSet(
  body: CreateQuestionSetRequest,
): Promise<QuestionSetDetailResponse> {
  return request<QuestionSetDetailResponse>("/question-sets", { method: "POST", body });
}

/** GET /question-sets/{setId} — 세트 정보와 문항 목록 */
export function getQuestionSet(setId: number): Promise<QuestionSetDetailResponse> {
  return request<QuestionSetDetailResponse>(`/question-sets/${setId}`);
}

/** PUT /question-sets/{setId} — 제목·설명·문항 순서 변경 (확정 전에만) */
export function updateQuestionSet(
  setId: number,
  body: UpdateQuestionSetRequest,
): Promise<QuestionSetDetailResponse> {
  return request<QuestionSetDetailResponse>(`/question-sets/${setId}`, { method: "PUT", body });
}

/** POST /question-sets/{setId}/confirm — 검토 완료 → CONFIRMED. 확정 세트만 출제 가능 */
export function confirmQuestionSet(setId: number): Promise<QuestionSetDetailResponse> {
  return request<QuestionSetDetailResponse>(`/question-sets/${setId}/confirm`, {
    method: "POST",
  });
}

/** POST /question-sets/{setId}/duplicate — 확정 세트를 DRAFT 사본으로 복제 */
export function duplicateQuestionSet(setId: number): Promise<QuestionSetDetailResponse> {
  return request<QuestionSetDetailResponse>(`/question-sets/${setId}/duplicate`, {
    method: "POST",
  });
}

/** POST /question-sets/{setId}/questions/generate — 조건으로 AI 문항을 세트에 추가 (최초 5회 무료) */
export function generateQuestionSet(
  setId: number,
  body: GenerateQuestionSetRequest,
): Promise<QuestionSetDetailResponse> {
  return request<QuestionSetDetailResponse>(`/question-sets/${setId}/questions/generate`, {
    method: "POST",
    body,
  });
}

/** POST /question-sets/{setId}/questions/generate-from-file — 강의자료 기반 AI 문항 생성(멀티파트 "file") */
export function generateFromFile(setId: number, file: File): Promise<QuestionSetDetailResponse> {
  const form = new FormData();
  form.append("file", file);
  return requestMultipart<QuestionSetDetailResponse>(
    `/question-sets/${setId}/questions/generate-from-file`,
    form,
  );
}
