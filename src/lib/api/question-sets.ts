import type {
  AiUsageResponse,
  GenerateQuestionSetRequest,
  MaterialUploadResponse,
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

/** @draft — 계약 없음. tasks.md T027·T028·T076·T087 경로. 계약 도착 시 수정 */
export function generateQuestionSet(
  body: GenerateQuestionSetRequest,
): Promise<QuestionSetDetailResponse> {
  return request<QuestionSetDetailResponse>("/question-sets/generate", { method: "POST", body });
}

/** @draft — 계약 없음. tasks.md T027·T028·T076·T087 경로. 계약 도착 시 수정 */
export function getQuestionSet(setId: number): Promise<QuestionSetDetailResponse> {
  return request<QuestionSetDetailResponse>(`/question-sets/${setId}`);
}

/** @draft — 계약 없음. tasks.md T027·T028·T076·T087 경로. 계약 도착 시 수정 */
export function updateQuestionSet(
  setId: number,
  body: UpdateQuestionSetRequest,
): Promise<QuestionSetDetailResponse> {
  return request<QuestionSetDetailResponse>(`/question-sets/${setId}`, { method: "PATCH", body });
}

/** @draft — 계약 없음. tasks.md T027·T028·T076·T087 경로. 계약 도착 시 수정 */
export function confirmQuestionSet(setId: number): Promise<QuestionSetDetailResponse> {
  return request<QuestionSetDetailResponse>(`/question-sets/${setId}/confirm`, {
    method: "POST",
  });
}

/** @draft — 계약 없음. tasks.md T027·T028·T076·T087 경로. 계약 도착 시 수정 */
export function cloneQuestionSet(setId: number): Promise<QuestionSetDetailResponse> {
  return request<QuestionSetDetailResponse>(`/question-sets/${setId}/clone`, { method: "POST" });
}

/** @draft — 계약 없음. tasks.md T027·T028·T076·T087 경로. 계약 도착 시 수정 */
export function getAiUsage(): Promise<AiUsageResponse> {
  return request<AiUsageResponse>("/me/ai-usage");
}

/** @draft — 계약 없음. tasks.md T027·T028·T076·T087 경로. 계약 도착 시 수정 (멀티파트 "file") */
export function uploadMaterial(file: File): Promise<MaterialUploadResponse> {
  const form = new FormData();
  form.append("file", file);
  return requestMultipart<MaterialUploadResponse>("/materials", form);
}
